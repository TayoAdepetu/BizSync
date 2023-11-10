<template>
  <div>
    <!--This shows all your workspaces and user personal activities (e.g. to-dos). Click on a workspace to go to the workspace's projects-->
    <v-container>
      <v-dialog v-model="dialogg" max-width="355" persistent>
        <v-container class="d-block">
          <v-row no-gutters align="center" justify="space-between">
            <v-row no-gutters>
              <h3>Add Workspace</h3>
            </v-row>
            <v-icon @click="dialogg = false">mdi-close</v-icon>
          </v-row>
          <v-form ref="form" v-model="valid">
            <div class="d-flex flex-column">
              <v-text-field
                label="Workspace title"
                name="title"
                type="text"
                :rules="[(v) => !!v || 'Workspace title is required']"
                required
                v-model="new_workspace.title"
              ></v-text-field>
              <v-btn
                v-if="enableColor === false"
                depressed
                @click="enableColor = true"
              >
                Choose workspace color
              </v-btn>
              <br />
              <v-color-picker
                v-if="enableColor === true"
                v-model="new_workspace.color"
                dot-size="25"
                hide-inputs
                swatches-max-height="100"
              ></v-color-picker>
              <div
                class="d-flex flex-column align-center justify-center flex-grow-1 upload-block"
                @click="chooseImage"
                :style="`background-image: url('${
                  new_workspace.image.downloadURL
                    ? new_workspace.image.downloadURL
                    : ''
                }');height:150px;background-size: cover;background-position: center;`"
              >
                <template
                  v-if="!fileToUpload.progress || fileToUpload.progress == 0"
                >
                  <v-icon>mdi-camera</v-icon>
                  <p>Add a workspace background</p>
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
              <v-btn :disabled="!valid" color="primary" @click="createWorkspace"
                >Submit</v-btn
              >
            </div>
          </v-form>
        </v-container>
      </v-dialog>

      <div v-if="user">
        <div class="d-flex flex-row align-center justify-space-between">
          <h1>My Workspaces</h1>
          <v-btn small depressed @click="addWorkspace">ADD WORKSPACE</v-btn>
        </div>

        <div
          v-if="workspaces.length === 0"
          class="h-screen flex items-center justify-center"
        >
          <p class="text-center">You have no workspaces yet.</p>
        </div>

        <v-card
          v-else
          :style="
            workspace.image.downloadURL != ''
              ? `background:url(${workspace.image.downloadURL});`
              : workspace.color
              ? `background-color:${workspace.color}`
              : ''
          "
          @click="$router.push('/bizsync/workspace/' + workspace.workspace_id)"
          class="jello-board-tile"
          v-for="workspace in workspaces"
          v-bind:key="workspace.id"
        >
          <v-card-title
            :style="workspace.image.downloadURL != '' ? 'color:#fff' : ''"
          >
            {{ workspace.title }}
          </v-card-title>
          <v-card-subtitle
            :style="workspace.image.downloadURL != '' ? 'color:#fff' : ''"
          >
            created {{ workspace.createdAt | formatDate }}
          </v-card-subtitle>
        </v-card>
      </div>

      <div v-else class="height-[100vw] w-100">
        <div class="h-screen flex items-center justify-center">
          <p class="text-center">
            You have to register/login to create/see your Workspaces
          </p>
        </div>
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
<script setup>
  const { user, registerUser } = firebaseAuth(); // auto-imported
  import { v4 as uuidv4 } from "uuid";

  const workspaces = ref([]);
  const enableColor = ref(false);
  var dialogg = false;
  const valid = ref(false);
  const newWorkspace = reactive({
    title: "",
    color: "",
    owner_id: "",
    createdAt: null,
    workspace_id: "",
    members: [],
    image: {
      name: "",
      originalName: "",
      downloadURL: "",
      uuid: "",
    },
  });

  const snackbar = false;
  const snackbarText = "No error message";
  var fileToUpload = {};

  onMounted(() => {
    fetchData();
    console.log(user);
  });
  const fetchData = async () => {
    try {
      const workspacesMap = {}; // Use a map to store workspaces by their unique IDs

      // Query for workspaces owned by the user
      await $nuxt.$fire.firestore
        .collection("workspaces")
        .where("owner_id", "==", $nuxt.user.public_reference_id)
        .orderBy("createdAt")
        .onSnapshot((receiverSnapshot) => {
          for (const doc of receiverSnapshot.docs) {
            const reference = doc.data();

            console.log("Workspaces owned by user");

            if (!workspacesMap[reference.workspace_id]) {
              workspacesMap[reference.workspace_id] = reference; // Add the workspace to the map
            }
          }

          // Convert the chat channels map to an array
          $nuxt.workspaces = Object.values(workspacesMap);
        });

      // Query for workspaces where the user is a member
      await $nuxt.$fire.firestore
        .collection("workspaces")
        .where("members", "array-contains", $nuxt.user.public_reference_id)
        .orderBy("createdAt")
        .onSnapshot((receiverSnapshot) => {
          for (const doc of receiverSnapshot.docs) {
            const reference = doc.data();

            console.log("Workspaces where user is a member");

            if (!workspacesMap[reference.workspace_id]) {
              workspacesMap[reference.workspace_id] = reference; // Add the workspace to the map
            }
          }

          // Convert the chat channels map to an array
          $nuxt.workspaces = Object.values(workspacesMap);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const addWorkspace = () => {
    //lets create a temp id we can use to save our doc and our storage files
    this.new_workspace.workspace_id = uuidv4();
    this.new_workspace.owner_id = this.user.public_reference_id;
    this.new_workspace.members = [this.user.public_reference_id];

    this.dialogg = true;
  };
  const createWorkspace = async () => {
    try {
      //Let's give our board a created date.
      this.new_workspace.createdAt = Date.now();
      await this.$fire.firestore
        .collection("workspaces")
        .add(this.new_workspace)
        .then((docRef) => {
          this.dialogg = false;
          this.snackbarText = "Successfully created your workspace";
          this.snackbar = true;
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const chooseImage = () => {
    this.$refs["boardBackground"].click();
    console.log("ChooseImage Clicked");
  };
  const onFileClicked = ($event) => {
    $event.target.value = "";
  };
  const onFileSelected = (event) => {
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
  };
  const uploadFiles = () => {
    const itemFilename =
      this.fileToUpload.uuid + "-" + this.fileToUpload.file.name;
    const itemName =
      "images" +
      "/" +
      "workspaces" +
      "/" +
      this.new_workspace.workspace_id +
      "/" +
      itemFilename;

    const itemRef = this.$fire.storage.ref().child(itemName);
    const itemMeta = {
      customMetadata: {
        owner: this.user.public_reference_id,
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
        this.new_workspace.image = {
          name: itemFilename,
          originalName: this.fileToUpload.file.name,
          downloadURL: url,
          uuid: this.fileToUpload.uuid,
        };
      }
    );
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

  .v-container {
    padding: 0;
  }
</style>
