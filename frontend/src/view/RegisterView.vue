
<template>
    <div>
      <h1>Register</h1>
      <form @submit.prevent="register">
        <label>Username:</label>
        <input type="text" v-model="username" />
        <br />
        <label>Password:</label>
        <input type="password" v-model="password" />
        <br />
        <label>Konfirmasi Password:</label>
        <input type="password" v-model="confirmPassword" />
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RegisterView',
    data() {
      return {
        username: '',
        password: '',
        confirmPassword: '',
      }
    },
    methods: {
      async register() {
        try {
          const response = await this.$axios.post('/register', {
            username: this.username,
            password: this.password,
          });
          this.$router.push({ name: 'login' });
        } catch (error) {
          console.error(error);
        }
      },
    },
  }
  </script>
  