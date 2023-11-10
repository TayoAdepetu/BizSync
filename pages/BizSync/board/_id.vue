<template>
  <div
    class="d-flex flex-column board"
    :style="
      board.image.downloadURL != ''
        ? `background:url(${board.image.downloadURL});background-size:cover;`
        : board.color
        ? `background-color:${board.color}`
        : ''
    "
  >
    <div class="d-block">
      <v-container fluid class="jello-topbar">
        <div class="d-flex justify-space-between">
          <v-icon @click="drawer = true">mdi-menu</v-icon>
          <nuxt-link to="/">
            <v-row no-gutters align="center" justify="space-between">
              <h3 class="logo">BizSync</h3>
            </v-row>
          </nuxt-link>
          <v-icon small @click="deleteBoard()">mdi-delete-outline</v-icon>
        </div>
      </v-container>
      <v-navigation-drawer
        v-model="drawer"
        fixed
        left
        class="d-block px-3 py-3"
      >
        <v-container fluid class="jello-topbar">
          <v-row no-gutters align="center" justify="space-between">
            <v-icon @click="drawer = false">mdi-close</v-icon>

            <v-row no-gutters align="center" justify="end">
              <p class="jello-user">
                Signed in as<br />
                {{ $nuxt.$fire.auth.currentUser.email }}
              </p>
              &nbsp;
              <v-icon>mdi-account-circle-outline</v-icon>
            </v-row>
          </v-row>
        </v-container>
        <v-container class="d-block menu-items">
          <div class="d-flex flex-column">
            <div class="d-flex">
              <br />
            </div>
            <div class="d-flex">
              <nuxt-link to="/">
                <v-icon>mdi-view-dashboard-variant-outline</v-icon
                >&nbsp;&nbsp;<b>My Boards</b>
              </nuxt-link>
            </div>
            <div class="d-flex">
              <nuxt-link to="/auth/signout">
                <v-icon>mdi-exit-to-app</v-icon>&nbsp;&nbsp;<b>Sign out</b>
              </nuxt-link>
            </div>
          </div>
        </v-container>
      </v-navigation-drawer>
    </div>
    <h1>{{ board.title }}</h1>
    <small>created {{ board.createdAt | formatDate }}</small>
    <div class="d-flex flex-row pr-6 pt-3">
      <div
        v-for="list in board.lists"
        @drop="drop($event, list.list_id)"
        @dragover="allowDrop($event)"
        class="d-flex flex-column pt-3 mr-6 list"
        v-bind:key="list.id"
      >
        <div class="d-flex flex-row justify-space-between">
          <h4>{{ list.title }}</h4>
          <v-icon small @click="deleteList(list.id)">mdi-delete-outline</v-icon>
        </div>

        <!--display cards-->
        <v-card
          v-for="card in list.cards"
          :draggable="true"
          @dragover.prevent
          @dragstart="drag($event, card)"
          class="mt-5"
          @click="editCard(card)"
          v-bind:key="card.card_id"
        >
          <v-card-text> {{ card.title }} </v-card-text>
        </v-card>

        <v-btn
          depressed
          @click="
            dialogCard = true;
            listId = list.list_id;
          "
          class="mt-auto"
          >Add card</v-btn
        >
      </div>
      <v-dialog v-model="dialogCard" persistent max-width="600px">
        <v-card elevation="0">
          <v-card-title>
            <span class="headline">Card name</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Stuff to do"
                    v-model="card.title"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialogCard = false">
              Close
            </v-btn>
            <v-btn color="blue darken-1" text @click="createCard()">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div class="d-flex flex-row">
        <v-btn depressed @click="dialog = true" class="create-list"
          >Create new list</v-btn
        >
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card elevation="0">
            <v-card-title>
              <span class="headline">List name</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="Stuff to do"
                      v-model="list.title"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="dialog = false">
                Close
              </v-btn>
              <v-btn color="blue darken-1" text @click="createList()">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <v-dialog v-model="dialogEditCard" persistent max-width="600px">
        <v-card elevation="0">
          <v-card-title>
            <span class="headline">{{ currentCard.title }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Edit title"
                    v-model="currentCard.title"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="deleteCard()">
              Delete
            </v-btn>
            <v-btn color="blue darken-1" text @click="dialogEditCard = false">
              Close
            </v-btn>
            <v-btn color="blue darken-1" text @click="updateCard()">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
  import { v4 as uuidv4 } from "uuid";
  export default {
    layout: "board",
    data() {
      return {
        listId: "",
        list: {
          title: "",
        },
        card: {
          title: "",
        },
        currentCard: {},
        cardDraggedId: "",
        cardDraggedListId: "",
        dialog: false,
        dialogCard: false,
        dialogEditCard: false,
        drawer: false,
      };
    },
    async asyncData({ params }) {
      //lets get our board data before page load, and then after that await changes
      let boardRef = $nuxt.$fire.firestore
        .collection("boards")
        .where("board_id", "==", params.id)
        .where(
          "members",
          "array_contains",
          this.$auth.user.public_reference_id
        );
      let boardData = {};
      await boardRef
        .get()
        .then(function (doc) {
          if (doc.exists) {
            boardData = doc.data();
            // boardData.board_id = params.id;
          } else {
            $nuxt.$toast.error(
              "Sorry, you don't have access or board doesn't exits."
            );
          }
        })
        .catch((error) => {});
      // if (boardData.color != '' || boardData.image.downloadURL != '') {
      //   $nuxt.$emit('toggle-alt-topbar')
      // }
      return { board: boardData };
    },
    created() {
      let tempId = this.board.board_id;
      let boardRef = $nuxt.$fire.firestore
        .collection("boards")
        .where("board_id", "==", tempId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            this.board = doc.data();
            this.board.board_id = tempId;
          }
        });
    },
    methods: {
      async createList() {
        try {
          this.dialog = false;
          if (this.list.title != "") {
            //add to firebase
            //Let's give our list a created date.
            this.list.list_id = uuidv4();
            this.list.cards = [];
            this.list.createdAt = Date.now();
            if (this.board.lists) {
              this.board.lists.push(this.list);
            } else {
              this.board.lists = [];
              this.board.lists.push(this.list);
            }
            await this.updateBoard();
            this.list = {};
          }
        } catch (error) {
          console.log(error);
        }
      },
      async updateCardList(newlistId) {
        try {
          let tempListIndex = -1;
          let tempCardIndex = -1;
          let newListIndex = -1;
          let tempListCount = 0;
          let tempCardCount = 0;

          //get the index in current cards current list
          for (const list of this.board.lists) {
            if (list.list_id === newlistId) {
              newListIndex = tempListCount;
            }
            if (this.currentCard.listId === list.list_id) {
              //correct list, now find card
              tempListIndex = tempListCount;
              for (const card of list.cards) {
                if (card.card_id === this.currentCard.card_id) {
                  tempCardIndex = tempCardCount;
                }
                tempCardCount++;
              }
            }
            tempListCount++;
          }

          //remove currentCard from current list
          this.board.lists[tempListIndex].cards.splice(tempCardIndex, 1);

          //add currentCard to its new list
          this.currentCard.listId = newlistId;
          this.board.lists[newListIndex].cards.push(this.currentCard);

          await this.updateBoard();
        } catch (error) {
          console.log(error);
        }
      },
      allowDrop(ev) {
        ev.preventDefault();
      },
      drag(ev, card) {
        this.currentCard = card;
      },
      drop(ev, listId, cardId) {
        ev.preventDefault();
        // Check if the card is dropped in the same list
        if (listId === this.cardDraggedListId) {
          // Handle reordering within the same list
          this.reorderCardsWithinList(listId, cardId);
        } else {
          // Handle moving the card to a different list
          this.updateCardList(listId, cardId);
        }
      },

      reorderCardsWithinList(listId, cardId) {
        // Find the index of the card in the list
        const list = this.board.lists.find((list) => list.list_id === listId);
        if (list) {
          const fromIndex = list.cards.findIndex(
            (card) => card.card_id === this.cardDraggedId
          );
          const toIndex = list.cards.findIndex(
            (card) => card.card_id === cardId
          );

          if (fromIndex >= 0 && toIndex >= 0) {
            // Remove the card from its current position
            const [draggedCard] = list.cards.splice(fromIndex, 1);
            // Insert the card at the new position
            list.cards.splice(toIndex, 0, draggedCard);

            // Update the board
            this.updateBoard();
          }
        }
      },

      async deleteList(listId) {
        try {
          let index = -1;
          let count = 0;
          for (const list of this.board.lists) {
            if (list.list_id == listId) {
              index = count;
            }
            count++;
          }
          if (index > -1) {
            this.board.lists.splice(index, 1);
            await this.updateBoard();
          }
        } catch (error) {
          console.log(error);
        }
      },

      async createCard() {
        try {
          this.dialogCard = false;
          //show modal to capture card name
          //add card
          if (this.card.title != "") {
            //add to firebase
            //Let's give our card a created date.
            this.card.card_id = uuidv4();
            this.card.createdAt = Date.now();
            this.card.list_id = this.listId;
            if (this.board.lists) {
              let index = -1;
              let count = 0;
              for (const list of this.board.lists) {
                if (list.list_id === this.listId) {
                  index = count;
                }
                count++;
              }
              if (index != -1) {
                //we found the list, now push our card
                if (this.board.lists[index].cards) {
                  this.board.lists[index].cards.push(this.card);
                } else {
                  this.board.lists[index].cards = [];
                  this.board.lists[index].cards.push(this.card);
                }
              }
            }
            await this.updateBoard();
            this.card = {};
            this.listId = "";
          }
        } catch (error) {
          console.log(error);
        }
      },

      editCard(card) {
        this.dialogEditCard = true;
        this.currentCard = card;
      },

      async updateCard() {
        try {
          this.dialogEditCard = false;
          for (const list of this.board.lists) {
            if (this.currentCard.listId === list.list_id) {
              //correct list, now find card
              for (const card of list.cards) {
                if (card.card_id === this.currentCard.id) {
                  card = this.currentCard;
                }
              }
            }
          }
          await this.updateBoard();
        } catch (error) {
          console.log(error);
        }
      },

      async deleteCard() {
        try {
          this.dialogEditCard = false;
          let i = 0;
          let j = 0;
          let index = {
            list: -1,
            card: -1,
          };
          for (const list of this.board.lists) {
            if (this.currentCard.listId === list.list_id) {
              //correct list, now find card
              for (const card of list.cards) {
                if (card.card_id === this.currentCard.id) {
                  index.list = i;
                  index.card = j;
                }
                j++;
              }
            }
            i++;
          }
          if (index.list > -1) {
            this.board.lists[index.list].cards.splice(index.card, 1);
            await this.updateBoard();
          }
        } catch (error) {
          console.log(error);
        }
      },

      async deleteBoard() {
        try {
          await this.$fire.firestore
            .collection("boards")
            .where("board_id", "==", this.board.board_id)
            .delete()
            .then(() => {
              $nuxt.$router.push("/");
            })
            .catch(() => {});
        } catch (error) {
          $nuxt.$router.push("/");
        }
      },
      async updateBoard() {
        await this.$fire.firestore
          .collection("boards")
          .where("board_id", "==", this.board.board_id)
          .update(this.board, { merge: true });
      },
    },
  };
</script>

<style scoped>
  .board {
    padding: 12px;
    height: 100vh;
    overflow: scroll;
  }
  .board.list {
    min-width: 250px;
    background-color: rgb(228 228 228 / 35%);
    padding: 25px;
    border-radius: 12px;
    min-height: 70vh;
  }
  .board.create-list {
    background-color: rgb(228 228 228 / 35%);
  }

  .board a {
    text-decoration: none;
  }
  .board.menu-items a {
    color: var(--text-color);
    padding: 10px 0px 10px 3px;
    font-size: 24px;
  }
  .board.jello-topbar {
    background-color: rgb(255, 255, 255, 0);
    padding: 0px !important;
  }
</style>
