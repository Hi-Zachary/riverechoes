<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  text: string
}>()


const chatid = ref('')
const answer = ref(props.text)
const question = ref('')
const currentQuestion = ref('')
const answerDelta = ref('')
const loading = ref(false)
const userLocation = ref(null) 


function needsLocationInfo(text: string): boolean {
  const locationKeywords = ['附近', '周围', '周边', '身边', '就近', '旁边', '边上', '不远', '近处'];
  return locationKeywords.some(keyword => text.includes(keyword));
}


async function getUserLocation() {
  if (!navigator.geolocation) {
    console.log('浏览器不支持地理定位');
    return null;
  }
  
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (error) {
    console.warn('获取位置失败:', error);
    return null;
  }
}


onMounted(async () => {
  chatid.value = localStorage.getItem('chatid') ?? ''
  if (!chatid.value) {
    const data = await $fetch<{ chatid: string }>('/api/chatid');
    chatid.value = data.chatid;
    localStorage.setItem('chatid', chatid.value);
  }
  
  setInterval(() => {
    if (answerDelta.value) {
      answer.value += answerDelta.value.slice(0, 5);
      answerDelta.value = answerDelta.value.slice(5);
    }
  }, 50);
})

const askQuestion = async () => {
  if (!question.value.trim()) return;

  try {
    currentQuestion.value = question.value;
    
    let coords = null;
    if (needsLocationInfo(question.value)) {
      coords = userLocation.value;
      if (!coords) {
        coords = await getUserLocation();
        if (coords) {
          userLocation.value = coords;
          console.log('获取到位置信息:', coords);
        }
      }
    }
    
    const stream = await $fetch<ReadableStream>('/api/chat', {
      method: 'POST',
      body: {
        chatid: chatid.value,
        question: question.value,
        coords: coords 
      },
      responseType: "stream",
    })


    const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
    loading.value = true;
    let chunk = await reader.read();
    answer.value = '';
    
    while (!chunk.done) {
      chunk.value.trim().split('\n').forEach((text: string) => {
        if (text) {
          try {
            const data = JSON.parse(text.slice(6));
            answerDelta.value += data.answer;
          } catch (e) {
            
          }
        }
      })
      chunk = await reader.read();
    }
    
    question.value = '';
  } catch (e: any) {
    console.error(e);
    answer.value = e.data?.message ?? e.message ?? String(e);
  } finally {
    loading.value = false;
  }
}


const speakText = async () => {
  speak(answer.value);
}


const refreshLocation = async () => {
  try {
    const position = await getUserLocation();
    if (position) {
      userLocation.value = position;
      answer.value = `已更新您的位置信息，可以开始询问附近的地点了`;
    } else {
      answer.value = `无法获取您的位置信息，请检查浏览器权限设置`;
    }
  } catch (e) {
    answer.value = `获取位置失败: ${e.message || '未知错误'}`;
  }
}
</script>

<template>
  <div class="chatbox" v-bind="$attrs">
    <div class="upper">
      <input 
        v-model="question" 
        placeholder="输入问题" 
        @keyup.enter="askQuestion"
      />
      <button @click="askQuestion">提问</button>
      <button @click="speakText">语音</button>
      <button @click="refreshLocation" title="更新位置">定位</button>
    </div>
    <div class="answer-container">
      <span v-if="loading" class="thinking">（思考中）</span>
      <span>{{ answer }}</span>
    </div>
  </div>
</template>

<style scoped>
.chatbox {
  width: 100%;
}

.upper {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

button {
  font-size: 0.8rem;
  padding: 4px 8px;
  cursor: pointer;
}

input {
  flex-grow: 1;
  box-sizing: border-box;
  outline: none;
  padding: 4px 10px;
  border: 1px solid #bdbdbd;
  border-radius: 4px;
}

input::placeholder {
  color: #aaa;
  font-size: 0.8rem;
}

input:hover,
input:focus {
  border-color: #757575;
}

.answer-container {
  min-height: 20px;
  line-height: 1.5;
}

.thinking {
  color: #666;
  font-style: italic;
  margin-right: 8px;
}

/* 移动端适配 - 仅调整布局位置 */
@media (max-width: 480px) {
  .upper {
    flex-direction: column;
    gap: 4px;
  }
  
  input {
    width: 100%;
    margin-bottom: 4px;
    font-size: 16px; /* 防止iOS自动缩放 */
  }
  
  /* 按钮容器 */
  .upper {
    display: flex;
    flex-direction: column;
  }
  
  .upper > button {
    display: inline-block;
    width: calc(33.33% - 3px);
    margin-right: 4px;
    margin-bottom: 0;
  }
  
  .upper > button:last-child {
    margin-right: 0;
  }
  
  /* 重新排列：输入框在上，按钮在下 */
  .upper > input {
    order: 1;
    width: 100%;
    margin-bottom: 4px;
    margin-right: 0;
  }
  
  .upper > button:nth-child(2) { order: 2; }
  .upper > button:nth-child(3) { order: 3; }
  .upper > button:nth-child(4) { order: 4; }
  
  /* 按钮组水平排列 */
  .upper {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .upper > input {
    flex-basis: 100%;
  }
  
  .upper > button {
    flex-basis: calc(25% - 3px); 
  }
}
</style>