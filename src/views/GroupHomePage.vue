<template>
  <div>
    <!-- Title Bar -->
    <page-title>
      <template slot="center">
        Домашняя страница
      </template>
    </page-title>

    <div class="page-content">
      <div class="left-right-container">
        <div class="agenda-container">
          <div class="tile-header">
            <h4>Предстоящие события</h4>
            <router-link :to="`/${$route.params.groupID}/agenda/`"
              >Все</router-link
            >
          </div>
          <div
            v-if="agendaLoading"
            id="loading-indicator"
            class="loading loading-lg"
          ></div>

          <div
            v-for="(item, index) in agendaItems"
            v-else
            :key="item.creationDate.toDate().getTime()"
          >
            <agenda-item-date-header
              v-if="showDateHeader(index)"
              :date="item.date.toDate()"
            />
            <agenda-item
              :item="item"
              @itemSelected="handleAgendaSelected(index)"
            />
          </div>
        </div>

        <div class="divider-vert bg-dark"></div>

        <!-- Displays recent notes and flashcards -->
        <div class="recent-container">
          <div class="notes-container">
            <div class="tile-header">
              <h4>Недавние заметки</h4>
              <router-link :to="`/${$route.params.groupID}/notes/`"
                >Все</router-link
              >
            </div>
            <div class="icon-container">
              <div v-if="notesLoading" class="loading loading-lg"></div>
              <note-icon
                v-for="note in recentNotes"
                v-else
                :key="note.id"
                :info="note"
              />
            </div>
          </div>
          <div class="divider bg-dark"></div>
          <!-- Displays the group's most popular flashcards -->
          <div class="flashcards-container">
            <div class="tile-header">
              <h4>Недавние колекции</h4>
              <router-link :to="`/${$route.params.groupID}/flashcards/`"
                >Все</router-link
              >
            </div>

            <div class="icon-container">
              <div v-if="flashcardsLoading" class="loading loading-lg"></div>
              <flashcard-icon
                v-for="deck in recentFlashcards"
                v-else
                :key="deck.id"
                :info="deck"
                @click.native="changeVisibility(deck)"
              ></flashcard-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from '@/components/navigation/PageTitle';
import NoteIcon from '@/components/NoteIcon';
import FlashcardIcon from '@/components/flashcards/FlashcardIcon';
import AgendaItem from '@/components/agenda/AgendaItem';
import AgendaItemDateHeader from '@/components/agenda/AgendaItemDateHeader';
import { db } from '@/firebaseConfig';
import { isSameDay } from 'date-fns';

export default {
  name: 'GroupHomePage',
  components: {
    AgendaItem,
    AgendaItemDateHeader,
    PageTitle,
    NoteIcon,
    FlashcardIcon,
  },
  data() {
    return {
      recentNotes: [],
      notesLoading: true,
      recentFlashcards: [],
      flashcardsLoading: true,
      agendaItems: [],
      agendaLoading: true,
    };
  },
  watch: {
    '$route.params.groupID'() {
      this.loadData();
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    // Switch the decks location in firebase to public or private
    changeVisibility(deck) {
      console.log('test');

      let privateCol = db
        .collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('flashcards')
        .doc('private')
        .collection(this.$store.getters.uid)
        .doc(deck.id);

      let publicCol = db
        .collection('study-groups')
        .doc(this.$route.params.groupID)
        .collection('flashcards')
        .doc(deck.id);

      // Determine what firestore route the deck needs to be transferred to and from
      let from, to;
      if (deck.isPrivate) {
        from = privateCol;
        to = publicCol;
      } else {
        from = publicCol;
        to = privateCol;
      }
      return db
        .runTransaction((transaction) => {
          return transaction.get(from).then((deck) => {
            if (!deck.exists) {
              throw 'Deck does not exist!';
            }
            transaction.set(to, deck.data()); // Create new document
            transaction.delete(from); // Delete old document
          });
        })
        .then(() => {
          this.loadDecks();
        })
        .catch((error) => {
          console.log('Transaction failed: ', error);
        });
    },
    handleAgendaSelected(index) {
      this.$router.push(
        `/${this.$route.params.groupID}/agenda/${this.agendaItems[index].id}`
      );
    },
    showDateHeader(index) {
      if (index !== 0) {
        return !isSameDay(
          this.agendaItems[index].date.toDate(),
          this.agendaItems[index - 1].date.toDate()
        );
      } else {
        return true;
      }
    },
    loadData() {
      // Load recent notes by date last modified
      this.$bind(
        'recentNotes',
        db
          .collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('notes')
          .doc(this.$store.getters.uid)
          .collection('private')
          .orderBy('lastUpdated', 'asc')
          .limit(6)
      ).then((notes) => {
        this.recentNotes = notes;
        this.notesLoading = false;
      });
      this.$bind(
        'recentFlashcards',
        db
          .collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('flashcards')
          .orderBy('lastUpdated', 'desc')
          .limit(6)
      ).then((flashcards) => {
        this.recentFlashcards = flashcards;
        this.flashcardsLoading = false;
      });

      // Load agenda items?
      this.$bind(
        'agendaItems',
        db
          .collection('study-groups')
          .doc(this.$route.params.groupID)
          .collection('agenda')
          .orderBy('date', 'asc')
      ).then((agendaItems) => {
        this.agendaItems === agendaItems;
        this.agendaLoading = false;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import '@/styles.scss';

.page-content {
  display: flex;
  flex-flow: column nowrap;
  height: $page-with-header-height;
  .left-right-container {
    display: flex;
    flex-flow: row nowrap;
    height: 100%;
    .agenda-container {
      flex: 1;
      height: 100%;
      padding: 0 20px 20px 20px;
      overflow: auto;
      #loading-indicator {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
      }
    }
    .divider-vert {
      padding: 0;
    }
    @media only screen and (max-height: 800px) {
      .recent-container,
      .agenda-container {
        min-height: 800px;
      }
    }
    .recent-container {
      display: flex;
      flex-flow: column nowrap;
      flex: 2;
      text-align: left;
      justify-content: center;
      align-items: space-between;
      max-width: 70%;
      .notes-container {
        flex: 1;
      }
      .flashcards-container {
        flex: 1;
      }
    }
  }
}
.icon-container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  overflow-y: hidden;
  #note {
    margin-left: 20px;
  }
  #flashcard {
    margin-left: 20px;
  }
}
.tile-header {
  display: flex;
  flex-flow: row no-wrap;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  h4 {
    font-family: $secondary-font;
    font-weight: 600;
    font-size: 18px;
  }
}
.loading.loading-lg {
  margin: 20% auto;
}
</style>
