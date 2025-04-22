<template>
    <div class="bg-gray-200 p-6 rounded-lg shadow-md">
      <div v-if="isChartLoading" class="text-center py-4 font-semibold text-gray-700">
        Loading chart...
      </div>
      <canvas v-show="!isChartLoading" ref="chartCanvas" class="w-full h-64"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'LeaderboardChart',
    props: {
      gameCode: {
        type: String,
        required: true
      }
    },
    setup(props) {
      const chartCanvas = ref(null);
      const chartInstance = ref(null);
      const isChartLoading = ref(true);
  
      const fetchChartData = async () => {
  try {
    const res = await fetch(`https://api-fastify-pi.vercel.app/game/result?gameCode=${props.gameCode}`);
    const data = await res.json();
    console.log(data); // Memeriksa data untuk debugging
    if (data.message === 'End result retrieved successfully.' && data.teams) {
      renderChart(data.teams);
    } else {
      console.error('Invalid response format', data);
    }
  } catch (err) {
    console.error('Error fetching chart data:', err);
  } finally {
    isChartLoading.value = false;
  }
};
  
      const renderChart = (teams) => {
        if (!chartCanvas.value) return;
        if (chartInstance.value) chartInstance.value.destroy();
        const ctx = chartCanvas.value.getContext('2d');
        const datasets = teams.map(t => ({
          label: t.team,
          data: t.rounds.map(r => r.ContributionPoint),
          borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
          fill: false,
          tension: 0.3
        }));
        chartInstance.value = new Chart(ctx, {
          type: 'line',
          data: {
            labels: teams[0]?.rounds.map(r => r.round) || [],
            datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Contribution Points' }
              },
              x: {
                title: { display: true, text: 'Rounds' }
              }
            }
          }
        });
      };
  
      onMounted(() => {
        fetchChartData();
      });
  
      onBeforeUnmount(() => {
        if (chartInstance.value) chartInstance.value.destroy();
      });
  
      return {
        chartCanvas,
        isChartLoading
      };
    }
  };
  </script>
  