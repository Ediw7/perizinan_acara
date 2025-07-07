<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <label>Username:</label>
        <input type="text" v-model="username" />
        <br />
        <label>Password:</label>
        <input type="password" v-model="password" />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginView',
    data() {
      return {
        username: '',
        password: '',
      }
    },
    methods: {
      async login() {
        try {
          const response = await this.$axios.post('/login', {
            username: this.username,
            password: this.password,
          });
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', response.data.role);
          this.$router.push({ name: 'dashboard-operator' });
        } catch (error) {
          console.error(error);
        }
      },
    },
  }
  </script>





