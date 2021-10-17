<template>
  <!-- steps indicator -->
  <ul class="step">
    <li :class="active === 0 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Назва групи">Крок 1</a>
    </li>
    <li :class="active === 1 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Им'я керівника">Крок 2</a>
    </li>
    <li :class="active === 2 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Час">Крок 3</a>
    </li>
    <li :class="active === 3 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Місце">Крок 4</a>
    </li>
    <li :class="active === 4 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Веб-сайт керівника">Крок 5</a>
    </li>
    <li :class="active === 5 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Додаткова інформація">Крок 6</a>
    </li>
    <li :class="active === 6 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Підтвердіть створення">Крок 7</a>
    </li>
    <li :class="active === 7 ? 'active' : ''" class="step-item">
      <a class="tooltip" data-tooltip="Выполнено">Зроблено</a>
    </li>
  </ul>
</template>

<script>
export default {
  name: "Steps",
  props: {
    active: {
      type: Number,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles.scss";

.step {
  box-shadow: $shadow;
  position: fixed;
  bottom: 0;
  padding: 5px 10px;
  margin: 30px auto;
  width: 80%;
  border-radius: 10px;
  background-color: white;
}
</style>
