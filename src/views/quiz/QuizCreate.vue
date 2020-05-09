<template>
  <div>
    <page-title>
      <template slot="left">
        <button
          class="btn btn-success"
          :class="
            selectedDecks == null ||
            questionCount === 0 ||
            selectedQTypes == null ||
            selectedQTypes.length === 0
              ? 'disabled'
              : ''
          "
          @click="loadQuiz()"
        >
          Создать
          <i class="fas fa-plus ml-2"></i>
        </button>
      </template>
      <template slot="center">
        Создать новый опрос
      </template>
      <template slot="right">
        <!-- Using the title class in the PageTitle component -->
        <h2 class="title">{{ questionCount }}/100</h2>
      </template>
    </page-title>
    <div class="content-container">
      <h3 id="step-instruction">Выберите тип опроса</h3>
      <question-type-selector @selected="selectedQTypes = $event" />

      <h3 id="step-instruction">Выберите карточки и создайте опрос</h3>
      <h5 id="step-hint">(Опрос имеет лимит в 100 карточек)</h5>
      <!-- Component that displays checkboxes of each available flashcard deck -->
      <deck-selector :limit="100" @selected="selectedDecks = $event" />
    </div>
  </div>
</template>

<script>
import PageTitle from "@/components/navigation/PageTitle";
import DeckSelector from "@/components/quiz/DeckSelector";
import QuestionTypeSelector from "@/components/quiz/QuestionTypeSelector";

export default {
  name: "QuizCreate",
  components: {
    PageTitle,
    DeckSelector,
    QuestionTypeSelector
  },
  data() {
    return {
      selectedDecks: null,
      selectedQTypes: null
    };
  },
  computed: {
    questionCount() {
      // Return the total number of cards/questions in the selected decks
      if (this.selectedDecks !== null) {
        let total = 0;
        this.selectedDecks.public.forEach(deck => {
          total += deck.terms.length;
        });
        this.selectedDecks.private.forEach(deck => {
          total += deck.terms.length;
        });

        return total;
      }
      return 0;
    }
  },
  methods: {
    loadQuiz() {
      let terms = [];
      let defs = [];
      this.selectedDecks.public.forEach(deck => {
        terms = terms.concat(deck.terms);
        defs = defs.concat(deck.definitions);
      });

      this.selectedDecks.private.forEach(deck => {
        terms = terms.concat(deck.terms);
        defs = defs.concat(deck.definitions);
      });

      this.$router.push({
        name: "quiz",
        params: {
          terms: terms,
          definitions: defs,
          questionTypes: this.selectedQTypes
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles.scss";

#step-instruction {
  text-align: center;
  padding-top: 20px;
  margin: 0;
}
#step-hint {
  text-align: center;
  color: $secondary-light;
  text-transform: lowercase;
  margin-bottom: 20px;
  font-size: 16px;
}
.content-container {
  height: $page-with-header-height;
}
</style>
