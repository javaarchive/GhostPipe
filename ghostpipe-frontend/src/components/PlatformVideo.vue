<template>
  <div>
    <h1> {{title}} </h1>
    <p v-bind:title="vid"> Insert Description Here video id is {{vid}} ok </p>
  </div>
</template>

<script>

export default {
  name: 'PlatformVideo',

  data: () => {
    return {
      title: "Loading...",
      isLoading: true
    }
  },
  props: ["minimal","vid"]
}
</script>
