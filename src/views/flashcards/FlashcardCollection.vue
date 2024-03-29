<template>
  <div>
    <page-title>
      <template slot="left">
        <button
          class="btn btn-primary"
          @click="$router.push(`/${$route.params.groupID}/flashcards/create`)"
        >
          Додати <i class="fas fa-plus ml-2"></i>
        </button>
      </template>
      <template slot="center">Колекція карток з тестами</template>
      <template slot="right">
        <div class="has-icon-left">
          <input
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="Поиск"
          />
          <i class="form-icon fas fa-search"></i>
        </div>
      </template>
    </page-title>
    <div v-if="!publicIsLoading && !privateIsLoading" class="card-container">
      <flashcard-icon
        v-for="deck in combined"
        :key="deck.creationDate.toDate().getTime()"
        :info="deck"
        :is-private="deck.isPrivate"
        @toggle="changeVisibility(deck)"
      >
      </flashcard-icon>
    </div>
    <div v-else class="loading loading-lg"></div>
  </div>
</template>

<script>
import FlashcardIcon from "@/components/flashcards/FlashcardIcon";
import PageTitle from "@/components/navigation/PageTitle";
import { db } from "@/firebaseConfig";

export default {
  name: "FlashcardCollection",
  components: {
    PageTitle,
    FlashcardIcon
  },
  data() {
    return {
      privateIsLoading: true,
      publicIsLoading: true,
      publicDecks: [],
      privateDecks: [],
      decks: [],
      searchQuery: "",
      groupID: this.$route.params.groupID,
      uid: this.$store.getters.uid
    };
  },
  computed: {
    combined() {
      // Combine the public and private decks into a single array
      let decks = this.privateDecks.concat(this.publicDecks);
      // Filter the deck display based on the search word
      return decks.filter(deck => {
        return deck.title
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      });
    }
  },
  created() {
    this.loadDecks();
  },
  methods: {
    // Load the decks, modifying the data where necessary
    loadDecks() {
      // Reset the deck array objects in case of reload
      this.privateDecks = [];
      this.publicDecks = [];

      let publicCol = db
        .collection("study-groups")
        .doc(this.$route.params.groupID)
        .collection("flashcards");

      let privateCol = db
        .collection("study-groups")
        .doc(this.$route.params.groupID)
        .collection("flashcards")
        .doc("private")
        .collection(this.$store.getters.uid);

      // Load the public decks from the group, don't include the "private" collection as a deck
      publicCol
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(deck => {
            let out = { id: deck.id, ...deck.data() };
            out.isPrivate = false;
            if (deck.id !== "private") {
              this.publicDecks.push(out);
            }
          });
        })
        .then(() => {
          this.publicIsLoading = false;
        });

      // Load the private decks, set the isPrivate field to true for each deck
      privateCol
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(deck => {
            let out = { id: deck.id, ...deck.data() };
            out.isPrivate = true;
            this.privateDecks.push(out);
          });
        })
        .then(() => {
          this.privateIsLoading = false;
        });
    },
    // Switch the decks location in firebase to public or private
    changeVisibility(deck) {
      // Modify the document in firebase when the user toggles.
      let privateCol = db
        .collection("study-groups")
        .doc(this.$route.params.groupID)
        .collection("flashcards")
        .doc("private")
        .collection(this.$store.getters.uid)
        .doc(deck.id);

      let publicCol = db
        .collection("study-groups")
        .doc(this.$route.params.groupID)
        .collection("flashcards")
        .doc(deck.id);

      let from, to;
      if (deck.isPrivate) {
        from = privateCol;
        to = publicCol;
      } else {
        from = publicCol;
        to = privateCol;
      }
      return (
        db
          .runTransaction(transaction => {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(from).then(deck => {
              // Get the contents of the existing document
              if (!deck.exists) {
                throw "Deck does not exist!";
              }
              transaction.set(to, deck.data()); // Create new document
              transaction.delete(from); // Delete old document
            });
          })
          .then(() => {
            this.loadDecks();
          })
          // Error switching flashcard deck location
          .catch(error => {
            console.log("Transaction failed: ", error);
          })
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles.scss";

h5 {
  font-family: $secondary-font;
  font-weight: 700;
  margin: 20px;
}
.card-container {
  margin: 20px;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 288px));
  grid-auto-rows: 218px;
  justify-content: center;
  transition: all 350ms ease-in;
}
</style>
