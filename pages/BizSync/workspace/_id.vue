<template>
  <div class="page-container">
    <!--This shows all the projects in a particular workspace. Click on any to go to a porject's kanban boards-->

    <v-container>
      <v-dialog v-model="dialog" max-width="355" persistent>
        <v-container class="d-block">
          <v-row no-gutters align="center" justify="space-between">
            <v-row no-gutters>
              <h3>Add Project</h3>
            </v-row>
            <v-icon @click="dialog = false">mdi-close</v-icon>
          </v-row>
          <v-form ref="form" v-model="valid">
            <div class="d-flex flex-column">
              <v-text-field
                label="Project title"
                name="title"
                type="text"
                :rules="[(v) => !!v || 'Project title is required']"
                required
                v-model="new_project.title"
              ></v-text-field>
              <v-btn
                v-if="enableColor === false"
                depressed
                @click="enableColor = true"
              >
                Choose project color
              </v-btn>
              <br />
              <v-color-picker
                v-if="enableColor === true"
                v-model="new_project.color"
                dot-size="25"
                hide-inputs
                swatches-max-height="100"
              ></v-color-picker>
              <div
                class="d-flex flex-column align-center justify-center flex-grow-1 upload-block"
                @click="chooseImage"
                :style="`background-image: url('${
                  new_project.image.downloadURL
                    ? new_project.image.downloadURL
                    : ''
                }');height:150px;background-size: cover;background-position: center;`"
              >
                <template
                  v-if="!fileToUpload.progress || fileToUpload.progress == 0"
                >
                  <v-icon>mdi-camera</v-icon>
                  <p>Add a project background</p>
                  <input
                    type="file"
                    accept="jpg, jpeg, png"
                    ref="boardBackground"
                    multiple
                    color="#f66f26"
                    buffer-value="0"
                    @click="onFileClicked($event)"
                    @change="onFileSelected($event)"
                    style="display: none"
                  />
                </template>
                <template
                  v-else-if="
                    fileToUpload.progress > 0 && fileToUpload.progress < 100
                  "
                >
                  <div class="text-center">
                    <v-progress-circular
                      :size="50"
                      color="green"
                      indeterminate
                    ></v-progress-circular>
                  </div>
                </template>
              </div>
              <v-btn :disabled="!valid" color="primary" @click="createProject"
                >Submit</v-btn
              >
            </div>
          </v-form>
        </v-container>
      </v-dialog>
      <div class="d-flex flex-row align-center justify-space-between">
        <h1>My PROJECTS</h1>
        <v-btn small depressed @click="addProject">ADD PROJECT</v-btn>
      </div>
      <div class="d-flex flex-wrap align-center justify-start">
        <p v-if="projects.length === 0">You have no projects yet.</p>
        <v-card
          :style="
            project.image.downloadURL != ''
              ? `background:url(${project.image.downloadURL});`
              : project.color
              ? `background-color:${project.color}`
              : ''
          "
          @click="$router.push('/bizsync/project/' + project.project_id)"
          class="jello-board-tile"
          v-for="project in projects"
          v-bind:key="project.id"
        >
          <v-card-title
            :style="project.image.downloadURL != '' ? 'color:#fff' : ''"
          >
            {{ project.title }}
          </v-card-title>
          <v-card-subtitle
            :style="project.image.downloadURL != '' ? 'color:#fff' : ''"
          >
            created {{ project.createdAt | formatDate }}
          </v-card-subtitle>
        </v-card>
      </div>
      <v-snackbar
        :timeout="3000"
        v-model="snackbar"
        absolute
        bottom
        color="primary"
      >
        {{ snackbarText }}
      </v-snackbar>
    </v-container>
  </div>
</template>
<script>
  import { v4 as uuidv4 } from "uuid";

  export default {
    layout: "board",
    data() {
      return {
        projects: [],
        enableColor: false,
        dialog: false,
        valid: false,
        new_project: {
          title: "",
          color: "",
          owner_id: "",
          project_id: "",
          createdAt: null,
          workspace_id: "",
          members: [],
          image: {
            name: "",
            originalName: "",
            downloadURL: "",
            uuid: "",
          },
        },
        snackbar: false,
        snackbarText: "No error message",
        fileToUpload: {},
      };
    },

    async asyncData() {
      try {
        const projectsMap = {}; // Use a map to store projects by their unique IDs

        // Query for projects owned by the user
        await $nuxt.$fire.firestore
          .collection("projects")
          .where("owner_id", "==", $nuxt.$auth.user.public_reference_id)
          .orderBy("createdAt")
          .onSnapshot((receiverSnapshot) => {
            for (const doc of receiverSnapshot.docs) {
              const reference = doc.data();

              console.log("Project owned by user");

              if (!projectsMap[reference.project_id]) {
                projectsMap[reference.project_id] = reference; // Add the project to the map
              }
            }

            // Convert the chat channels map to an array
            $nuxt.projects = Object.values(projectsMap);
          });

        // Query for projects where the user is a member
        await $nuxt.$fire.firestore
          .collection("projects")
          .where(
            "members",
            "array-contains",
            $nuxt.$auth.user.public_reference_id
          )
          .orderBy("createdAt")
          .onSnapshot((receiverSnapshot) => {
            for (const doc of receiverSnapshot.docs) {
              const reference = doc.data();

              console.log("Project where user is a member");

              if (!projectsMap[reference.project_id]) {
                projectsMap[reference.project_id] = reference; // Add the project to the map
              }
            }

            // Convert the chat channels map to an array
            $nuxt.projects = Object.values(projectsMap);
          });
      } catch (error) {
        console.log(error);
      }
    },

    methods: {
      addProject() {
        //lets create a temp id we can use to save our doc and our storage files
        this.new_project.project_id = uuidv4();
        this.new_project.workspace_id = this.$route.params.id;
        this.new_project.owner_id = this.$auth.user.public_reference_id;
        this.new_workspace.members = [this.$auth.user.public_reference_id];

        this.dialog = true;
      },
      async createProject() {
        try {
          //Let's give our board a created date.
          this.new_project.createdAt = Date.now();
          await this.$fire.firestore
            .collection("projects")
            .add(this.new_project)
            .then((docRef) => {
              this.dialog = false;
              this.snackbarText = "Successfully created your workspace";
              this.snackbar = true;
            })
            .catch((error) => {
              console.log(error);
            });
        } catch (error) {
          console.log(error);
        }
      },

      chooseImage() {
        this.$refs["boardBackground"].click();
        console.log("ChooseImage Clicked");
      },
      onFileClicked($event) {
        $event.target.value = "";
      },
      onFileSelected(event) {
        try {
          /// Process Selected Files
          let file = event.target.files[0];
          this.fileToUpload = {
            file,
            originalName: file.name,
            loading: false,
            progress: 0,
            success: false,
            error: false,
            previewPath: "",
            uuid: uuidv4(),
          };
          this.uploadFiles();
        } catch (error) {}
      },
      uploadFiles() {
        const itemFilename =
          this.fileToUpload.uuid + "-" + this.fileToUpload.file.name;
        const itemName =
          "images" +
          "/" +
          "projects" +
          "/" +
          this.new_project.project_id +
          "/" +
          itemFilename;

        const itemRef = this.$fire.storage.ref().child(itemName);
        const itemMeta = {
          customMetadata: {
            owner: this.$auth.user.public_reference_id,
          },
        };

        // Action upload
        const task = itemRef.put(this.fileToUpload.file, itemMeta);

        // Watch for upload status Changes
        return task.on(
          "state_changed",
          // Handle progress
          (progress) => {
            // Set upload progress on item
            this.fileToUpload.progress =
              (progress.bytesTransferred / progress.totalBytes) * 100;
          },
          // Handle unsuccessful uploads
          (error) => {
            this.fileToUpload.failed = true;
            this.fileToUpload.error = error;
            return false;
          },
          // Handle successful uploads on complete
          async () => {
            const url = await task.snapshot.ref
              .getDownloadURL()
              .catch((e) => false);
            // Store form media
            this.new_project.image = {
              name: itemFilename,
              originalName: this.fileToUpload.file.name,
              downloadURL: url,
              uuid: this.fileToUpload.uuid,
            };
          }
        );
      },
    },
  };
</script>
<style scoped>
  .v-dialog {
    border-radius: 15px;
    background-color: var(--white);
    padding: 15px;
  }
  .upload-block {
    border: 2px dashed #adadad;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 20px;
  }
</style>
