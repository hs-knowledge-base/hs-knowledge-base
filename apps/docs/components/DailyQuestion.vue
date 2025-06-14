<script setup>
import { ref, onMounted } from 'vue'

onMounted(() => {
  init()
})

const questions = [
  {
    question: "React中的useEffect和useLayoutEffect有什么区别？",
    answer: "useEffect是异步执行的，而useLayoutEffect是同步执行的。useLayoutEffect会在所有DOM变更之后同步调用，但在浏览器绘制之前完成。这使得它适合于需要在DOM更新后立即执行的操作，如测量DOM元素或者调整布局。而useEffect是在浏览器绘制之后异步执行的，更适合大多数副作用操作。"
  },
  {
    question: "什么是虚拟DOM，它有什么优势？",
    answer: "虚拟DOM是真实DOM的JavaScript表示。React等框架使用它来减少直接操作DOM的次数。优势包括：批量更新提高性能、跨平台能力、简化编程模型、提供声明式API。"
  },
  {
    question: "解释一下JavaScript中的闭包概念",
    answer: "闭包是指函数和其周围状态（词法环境）的组合。闭包允许函数访问并操作函数外部的变量。实际应用包括：创建私有变量、数据封装、函数工厂和柯里化等模式。"
  }
]

const dailyQuestion = ref(null)

const init = () => {
  const today = new Date()
  const index = today.getDate() % questions.length
  dailyQuestion.value = questions[index]
}
</script>

<template>
  <div class="custom-block" v-if="dailyQuestion">
    <p class="custom-block-title">💡 每日一题</p>
    <p>{{ dailyQuestion.question }}</p>
    <details>
      <summary>查看答案</summary>
      <p>{{ dailyQuestion.answer }}</p>
    </details>
  </div>
</template>