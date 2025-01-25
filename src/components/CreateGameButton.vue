<template>
    <div class="create-game">
      <button @click="createGame" class="btn-create">Create Game</button>
    </div>
  </template>
  
  <script>
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'CreateGameButton',
    setup() {
      const router = useRouter();
  
      const createGame = async () => {
        try {
          const response = await fetch('https://api-fastify-pi.vercel.app/game/creategame', {
            method: 'POST',
          });
          const result = await response.json();
  
          if (result.message === 'Game created successfully') {
            // Redirect ke halaman baru dengan gameCode
            router.push({ name: 'GamePage', params: { gameCode: result.data.gameCode } });
          } else {
            console.error('Failed to create game:', result);
          }
        } catch (error) {
          console.error('Error while creating game:', error);
        }
      };
  
      return { createGame };
    },
  };
  </script>
  
  <style>
  .create-game {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .btn-create {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  </style>
  