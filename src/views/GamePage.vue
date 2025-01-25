<template>
    <div class="game-page">
      <h1>Game Created!</h1>
      <p>Your game code is:</p>
      <h2 class="game-code">{{ gameCode }}</h2>
    </div>
  </template>
  
  <script>
  import { useRoute } from 'vue-router';
  
  export default {
    name: 'GamePage',
    setup() {
      const route = useRoute();
      const gameCode = route.params.gameCode;
  
      return { gameCode };
    },
  };
  </script>
  
  <style>
  .game-page {
    text-align: center;
    margin-top: 50px;
  }
  .game-code {
    font-size: 24px;
    color: #4caf50;
    font-weight: bold;
  }
  </style>
  