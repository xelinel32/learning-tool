<template>
  <div>
    <div
      class="agenda-item"
      :class="{ selected }"
      @click="$emit('itemSelected')"
    >
      <h3>{{ item.title }}</h3>
      <p id="days">{{ getRemainingDays(item.date.toDate()) }}</p>
    </div>
  </div>
</template>

<script>
import {
  isPast,
  distanceInWordsToNow,
  differenceInCalendarDays,
} from 'date-fns';

export default {
  name: 'AgendaItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSelected: false,
      borderColors: {
        close: '#cf4545',
        medium: '#32b643',
        far: '#dadee4',
      },
    };
  },
  computed: {
    /**
     * Change the item's border color based on its distance in the future
     *
     * DISABLED FOR NOW - the styling looks too busy with this feature enabled
     */
    getBorderColor() {
      let color = null;

      let remainingDays = differenceInCalendarDays(
        this.item.date.toDate(),
        Date.now()
      );
      if (remainingDays < 7) {
        color = this.borderColors.close;
      } else if (remainingDays > 7 && remainingDays <= 14) {
        color = this.borderColors.medium;
      } else {
        color = this.borderColors.far;
      }
      return {
        borderColor: '' + color,
      };
    },
  },
  methods: {
    getRemainingDays(date) {
      const ruLocale = require('date-fns/locale/ru');
      let locales = { locale: ruLocale };
      if (isPast(date)) {
        return distanceInWordsToNow(date, locales) + ' спустя';
      }
      return distanceInWordsToNow(date, locales);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.agenda-item {
  cursor: pointer;
  height: 80px;
  margin-bottom: 20px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  background-color: white;
  font-family: $secondary-font;
  transition: all 0.3s ease-in-out;
  #days {
    color: $secondary-light;
  }
  h3,
  p {
    padding: 0;
    margin: 0;
  }
  h3 {
    font-size: 1.3em;
    &.selected {
      color: $dark;
    }
  }
  p {
    font-family: $primary-font;
  }
  &:hover {
    box-shadow: $shadow-hovered;
  }
  &.selected {
    border: $border-selected;
    h3 {
      font-weight: 700;
    }
    #days {
      color: $dark;
    }
  }
}
</style>
