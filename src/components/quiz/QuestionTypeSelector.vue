<template>
  <div>
    <div id="container">
      <div
        v-for="type in questionTypes"
        id="type-toggle"
        :key="type.type"
        :class="type.selected ? 'selected' : ''"
        @click="toggleSelected(type)"
      >
        <div id="type-header">
          {{ type.type }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionTypeSelector',
  data() {
    return {
      questionTypes: [
        {
          type: 'Несколько вариантов',
          description:
            'Выберите правильный термин для данного определения из указанных вариантов',
          selected: false,
        },
        // {
        //   type: 'Сопоставление',
        //   description: 'Сопоставьте правильный термин с данным определением',
        //   selected: false,
        // },
        {
          type: 'Перетащите',
          description: 'Перетащите правильный термин в данное определение',
          selected: false,
        },
        {
          type: 'Коротки ответ',
          description: 'Введите правильный термин для данного определения',
          selected: false,
        },
      ],
    };
  },
  methods: {
    toggleSelected(type) {
      type.selected = !type.selected;
      this.$emit('selected', this.getAllSelected());
    },
    getAllSelected() {
      // Create object to be passed to the quiz page
      let selected = {
        matching: false,
        shortAnswer: false,
        multipleChoice: false,
        dragAndDrop: false,
      };
      // Every selected type is set to true
      this.questionTypes.forEach((type) => {
        if (type.selected === true) {
          switch (type.type) {
            case 'Несколько вариантов':
              selected.multipleChoice = true;
              break;
            case 'Сопоставление':
              selected.matching = true;
              break;
            case 'Перетащите':
              selected.dragAndDrop = true;
              break;
            case 'Коротки ответ':
              selected.shortAnswer = true;
              break;
            default:
              // console.log('error');
          }
        }
      });
      return selected;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

#container {
  margin: 20px;
  padding: 0 50px;
  display: grid;
  transition: all 350ms ease-in;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  #type-toggle {
    cursor: pointer;
    user-select: none;
    background-color: white;
    width: 200px;
    height: 60px;
    margin: 20px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    transition: box-shadow 0.3s linear;
    #type-header {
      text-align: center;
      font-family: $secondary-font;
      font-weight: 700;
      #type-description {
        font-size: 12px;
        color: $secondary-light;
      }
    }
    &.selected {
      border: $border-selected;
      box-shadow: $shadow;
    }
    &:hover {
      box-shadow: $shadow-hovered;
    }
  }
}
</style>
