<template>
  <div id="question">
    <h1>Сопоставьте с определением</h1>
    <!-- Terms Box -->
    <div id="terms-holder">
      <!-- Create draggable component for each term -->
      <drag
        v-for="(term, index) in drag"
        :key="index"
        class="drag"
        :draggable="term.draggable"
        :class="{ placed: !term.draggable }"
        :transfer-data="{ from: index, term: term.term }"
        >{{ term.term }}</drag
      >
    </div>

    <!-- Definitions Box -->
    <div id="defs-holder">
      <div id="left">
        <!-- Show a drop area for each term -->
        <drop
          v-for="(slot, index) in drop"
          :key="index"
          class="drop"
          :class="{ over: slot.over, filled: slot.filled }"
          @click.native="resetDrop(slot)"
          @dragover="handleDragOver(slot)"
          @dragleave="handleDragLeave(slot)"
          @drop="handleDrop(slot, ...arguments)"
        >
          {{ slot.text }}
        </drop>
      </div>
      <div id="right">
        <!-- Show all definitions -->
        <h2 class="answer__item" v-for="(slot, index) in drop" :key="index" :class="getStyle(slot)">
          {{ slot.definition }}
        </h2>
      </div>
    </div>
  </div>
</template>

<script>
import { Drag, Drop } from "vue-drag-drop";
export default {
  name: "DragDropQuestion",
  components: { Drag, Drop },
  props: {
    terms: {
      type: Array,
      required: true
    },
    defs: {
      type: Array,
      required: true
    },
    showCorrect: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function() {
    return {
      // Drag zone data
      drag: [],
      // Drop zone data
      drop: []
    };
  },
  created() {
    // Create the drag and drop data objects
    for (let i = 0; i < this.terms.length; i++) {
      this.drag.push({
        term: this.terms[i],
        draggable: true
      });

      this.drop.push({
        definition: this.defs[i],
        correctTerm: this.terms[i],
        isCorrect: false,
        text: "",
        over: false,
        filled: false,
        from: null
      });
    }

    // Shuffle the array of term objects so it is difficult to match to their defs
    for (let i = this.drop.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drop[i], this.drop[j]] = [this.drop[j], this.drop[i]];
    }
  },
  methods: {
    getStyle(slot) {
      if (this.showCorrect) {
        if (slot.isCorrect) {
          return "correct";
        } else {
          return "incorrect";
        }
      }
    },
    /**
     * Logic to handle what happens when a question is term is dropped on a def
     */
    handleDrop(drop, data) {
      if (drop.from == null) {
        drop.from = data.from;
        this.drag[data.from].draggable = false;
        drop.over = true;
        drop.filled = true;
        drop.text = data.term;
        this.$emit("answered", true);
      } else {
        this.drag[drop.from].draggable = true;
        drop.from = data.from;
        this.drag[data.from].draggable = false;
        drop.over = true;
        drop.filled = true;
        drop.text = data.term;
      }
      this.checkCorrect(drop);
    },
    checkCorrect(drop) {
      if (drop.text === drop.correctTerm) {
        this.$emit("correct", true);
        drop.isCorrect = true;
      } else {
        if (drop.isCorrect) {
          this.$emit("correct", false);
        }
        drop.isCorrect = false;
      }
    },
    handleDragOver(drop) {
      if (drop.text === "") {
        drop.over = true;
      }
    },
    handleDragLeave(drop) {
      if (drop.text === "") {
        drop.over = false;
      }
    },
    resetDrop(drop) {
      console.log("reset drop");

      if (drop.from !== null) {
        drop.text = "";
        drop.filled = false;
        drop.over = false;
        this.drag[drop.from].draggable = true;
        drop.from = null;
        drop.isCorrect = false;
        this.$emit("answered", false);
        this.$emit("correct", false);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles.scss";

h1 {
  margin: 0;
  font-size: 28px;
}
.answer__item{
  font-size: 26px;
}
#terms-holder {
  padding: 10px;
  margin-top: 10px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-evenly;
  align-items: center;
  background-color: white;
}
#defs-holder {
  padding: 10px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  box-shadow: $shadow;
  background-color: white;
  #right {
    flex: 6;
    text-align: center;
  }
}
.correct {
  color: green;
}
.incorrect {
  color: red;
}
.drag,
.drop {
  cursor: pointer;
  user-select: none;
  height: 50px;
  margin: 5px;
  min-width: 86px;
  padding: 10px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  background-color: $primary;
  color: white;
}
.drop {
  background-image: none;
  background-color: $transparent-hover;
}
.drag.placed {
  cursor: default;
  box-shadow: none;
  background-image: none;
  background-color: $transparent-hover;
}
.drop.over {
  background-color: lighten($primary, 20);
}
.drop.filled {
  box-shadow: none;
  cursor: pointer;
}
</style>
