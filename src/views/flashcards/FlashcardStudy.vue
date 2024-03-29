<template>
  <div v-if="dataloaded" class="content-container" @keyup.space="flipCard()">
    <!-- Page Title -->
    <page-title>
      <template slot="left">
        <button
          class="btn tooltip tooltip-right"
          data-tooltip="Перетосувати"
          :class="isShuffled ? 'btn-success' : 'btn-action'"
          @click="shuffleDeck"
        >
          <!-- Icon flashes when shuffle enabled -->
          <i
            :class="isShuffled ? 'animated flash' : ''"
            class="fas fa-random"
          ></i>
        </button>
      </template>
      <template slot="center">
        {{ deckName }}
      </template>
      <template slot="right">
        <button
          class="btn btn-action split"
          :class="myRating === -1 ? 'btn-error' : ''"
          @click="downvoteDeck()"
        >
          <i class="fas fa-frown"></i>
        </button>
        <button
          class="btn btn-action split"
          :class="myRating === 1 ? 'btn-success' : ''"
          @click="upvoteDeck()"
        >
          <i class="fas fa-smile"></i>
        </button>
      </template>
    </page-title>

    <!-- Main Content -->
    <div class="page-content">
      <div class="center-content">
        <button
          class="btn btn-action btn-primary btn-lg"
          :class="cardIndex === 0 ? 'disabled' : ''"
          @click.prevent="prevCard"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="flashcard-container">
          <div
            class="flashcard"
            :style="{ backgroundColor: cardColor }"
            @click.prevent="flipCard"
          >
            <h1 class="flashcard-content">
              {{ currentContent }}
            </h1>
          </div>
        </div>
        <!-- Button icon and color changes when user reaches the end -->
        <button
          class="btn btn-action btn-lg"
          style="transition: .5s;"
          :class="
            cardIndex === termList.length - 1
              ? 'btn-success btn-rotate'
              : 'btn-primary'
          "
          @click.prevent="nextCard"
        >
          <i
            :class="
              cardIndex === termList.length - 1
                ? 'fa-undo-alt'
                : 'fa-arrow-right'
            "
            class="fas fa-arrow-right"
          >
          </i>
        </button>
      </div>
      <h1 id="cardIndex">{{ cardIndex + 1 }} / {{ termList.length }}</h1>
    </div>
  </div>
  <div v-else class="loading loading-lg"></div>
</template>

<script>
import PageTitle from '@/components/navigation/PageTitle';
import { setTimeout } from 'timers';
import { db, FirebaseConsts } from '@/firebaseConfig';
import anime from 'animejs';

let flashcardCollection = null;

export default {
  name: 'FlashcardStudy',
  components: {
    PageTitle,
  },
  props: {
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      user: null,
      currentContent: String,
      cardIndex: 0,
      flipped: false,
      termList: [],
      isShuffled: false,
      definitionList: [],
      originalTermList: [],
      originalDefinitionList: [],
      cardColor: '#ffffff',
      deckName: '',
      dataloaded: false,
      upvoteList: [],
      downvoteList: [],
      myRating: 0,
    };
  },
  created() {
    const groupID = this.$route.params.groupID;
    const deckID = this.$route.params.deckID;
    flashcardCollection = db
      .collection('study-groups')
      .doc(groupID)
      .collection('flashcards');

    // Load from different firestore location if the deck if public or private
    if (this.isPrivate) {
      flashcardCollection = flashcardCollection
        .doc('private')
        .collection(this.$store.getters.uid)
        .doc(deckID);
    } else {
      flashcardCollection = flashcardCollection.doc(deckID);
    }

    // Load deck from firebase
    flashcardCollection
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.deckName = doc.data().title;
          this.originalTermList = doc.data().terms;
          this.originalDefinitionList = doc.data().definitions;
          this.termList = this.originalTermList.slice();
          this.definitionList = this.originalDefinitionList.slice();
          this.upvoteList = doc.data().upvotes;
          this.downvoteList = doc.data().downvotes;

          this.currentContent = this.termList[0];

          this.determineRating();

          this.dataloaded = true;
        }
      })
      .catch((error) => {
        console.log('Error getting document:', error);
      });
  },
  beforeMount() {
    window.addEventListener('keyup', this.keyPressed);
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.keyPressed);
  },
  methods: {
    determineRating() {
      if (this.upvoteList.includes(this.$store.getters.uid)) {
        this.myRating = 1;
      } else if (this.downvoteList.includes(this.$store.getters.uid)) {
        this.myRating = -1;
      } else {
        this.myRating = 0;
      }
    },
    upvoteDeck() {
      // Just remove the rating if they click same button
      if (this.myRating === 1) {
        flashcardCollection.update({
          upvotes: FirebaseConsts.firestore.FieldValue.arrayRemove(
            this.$store.getters.uid
          ),
        });
        this.myRating = 0;
      } else {
        // If they already downvoted, remove it and then upvote
        if (this.myRating === -1) {
          flashcardCollection.update({
            downvotes: FirebaseConsts.firestore.FieldValue.arrayRemove(
              this.$store.getters.uid
            ),
          });
          this.myRating = 0;
        }

        if (this.myRating === 0) {
          flashcardCollection.update({
            upvotes: FirebaseConsts.firestore.FieldValue.arrayUnion(
              this.$store.getters.uid
            ),
          });
          this.myRating = 1;
        }
      }
    },
    downvoteDeck() {
      // Just remove the rating if they click same button
      if (this.myRating === -1) {
        flashcardCollection.update({
          downvotes: FirebaseConsts.firestore.FieldValue.arrayRemove(
            this.$store.getters.uid
          ),
        });
        this.myRating = 0;
      } else {
        // If they already upvoted, remove it then downvote
        if (this.myRating === 1) {
          flashcardCollection.update({
            upvotes: FirebaseConsts.firestore.FieldValue.arrayRemove(
              this.$store.getters.uid
            ),
          });
          this.myRating = 0;
        }

        if (this.myRating === 0) {
          flashcardCollection.update({
            downvotes: FirebaseConsts.firestore.FieldValue.arrayUnion(
              this.$store.getters.uid
            ),
          });
          this.myRating = -1;
        }
      }
    },
    shuffleDeck() {
      if (this.isShuffled) {
        // If shuffled, reload original, unmodified lists
        this.isShuffled = false;
        this.termList = this.originalTermList.slice();
        this.definitionList = this.originalDefinitionList.slice();
        // console.log('back to original');
      } else {
        // Otherwise use a shuffle algorithm on the lists
        for (let i = this.termList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.termList[i], this.termList[j]] = [
            this.termList[j],
            this.termList[i],
          ];
          [this.definitionList[i], this.definitionList[j]] = [
            this.definitionList[j],
            this.definitionList[i],
          ];
        }
        // console.log('Shuffled');
        this.isShuffled = true;
      }
      // Reset the study position
      this.currentContent = this.termList[0];
      this.cardIndex = 0;
    },
    //flips the current card
    flipCard() {
      anime({
        targets: '.flashcard',
        height: [
          { value: 0, duration: 150 },
          { value: 300, duration: 150 },
        ],
      });
      anime({
        targets: '.flashcard-content',
        opacity: [
          { value: 0, duration: 150 },
          { value: 1, duration: 150 },
        ],
      });
      const self = this;
      setTimeout(() => {
        //definition side
        if (self.flipped) {
          self.getCurrentContent();
          self.flipped = false;
          self.cardColor = '#FFFFFF';
        }
        //term side
        else {
          self.getCurrentContent();
          self.flipped = true;
          self.cardColor = '#c5c5c5';
        }
      }, 100);
    },
    //increments the current card index and updates the displayed content
    nextCard() {
      if (this.cardIndex < this.termList.length - 1) {
        let nextAnimation = anime.timeline({
          targets: '.flashcard',
          easing: 'linear',
          duration: 100,
        });
        nextAnimation
          .add({
            rotate: -10,
            translateX: -200,
            opacity: 0,
          })
          .add({
            translateX: 200,
            opacity: 0,
            duration: 1,
          })
          .add({
            translateX: 0,
            opacity: 1,
            rotation: 0,
          });
        this.cardIndex++;
        const self = this;
        setTimeout(() => {
          self.currentContent = self.termList[self.cardIndex];
          self.flipped = false;
          self.cardColor = '#FFFFFF';
        }, 110);
      } else {
        this.cardIndex = 0;
        this.currentContent = this.termList[this.cardIndex];
      }
    },
    //decrements the current card index and updates the displayed info
    prevCard() {
      if (this.cardIndex > 0) {
        let prevAnimation = anime.timeline({
          targets: '.flashcard',
          easing: 'linear',
          duration: 100,
        });
        prevAnimation
          .add({
            rotate: 10,
            translateX: 200,
            opacity: 0,
          })
          .add({
            translateX: -200,
            opacity: 0,
            duration: 1,
          })
          .add({
            translateX: 0,
            opacity: 1,
            rotation: 0,
          });
        this.cardIndex--;
        const self = this;
        setTimeout(() => {
          self.flipped = false;
          self.currentContent = self.termList[self.cardIndex];
          self.cardColor = '#FFFFFF';
        }, 110);
      }
    },
    //loads the content that should be shown into the currentContent variable based on flipped variable
    getCurrentContent() {
      if (this.flipped) {
        this.currentContent = this.termList[this.cardIndex];
      } else {
        this.currentContent = this.definitionList[this.cardIndex];
      }
    },
    //calls the correct function based on key press
    keyPressed(event) {
      switch (event.which) {
        case 32:
          this.flipCard();
          break;
        case 37:
          this.prevCard();
          break;
        case 39:
          this.nextCard();
          break;
        case 38:
          this.flipCard();
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.page-content {
  height: $page-with-header-height;
  display: flex;
  flex-flow: column nowrap;
  place-content: center;
}
.center-content {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
.btn-rotate {
  transform: rotate(360deg);
}
.flashcard-container {
  min-height: 64vh;
  align-items: baseline;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.flashcard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #fff;
  width: 700px;
  min-height: 400px;
  margin: 0 20px;
  box-shadow: $shadow-heavy;
}
.flashcard-content {
  font-size: 300%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.btn {
  margin: 10px;
}
#cardIndex {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
