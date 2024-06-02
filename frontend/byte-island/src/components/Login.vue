<template>
  <v-container>
    <v-responsive
      class=" mx-auto"
    >
      <div class="text-center">

        <h1 class="text-h1 font-weight-bold my-10"><span style="color: #98FF86;">Byte</span> Islands</h1>
      </div>

      <div class="py-4" />

      <v-row class="login-form">
        <v-col cols="12">
          <v-form @submit.prevent>
            <v-text-field v-model="username" variant="outlined" :rules="[rules.required]" placeholder="Username" class="ital-input mb-2"></v-text-field>
            <v-text-field :type="show ? 'text' : 'password'" :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show = !show" v-model="password" variant="outlined" :rules="[rules.required]" placeholder="Password" class="ital-input mb-2"></v-text-field>
            <v-row align="center" justify="center" class="mt-5">
              <v-btn size="large" variant="outlined" class="form-btn mr-10" @click="wip()">Sign up</v-btn>
              <v-btn size="large" :disabled="!(username && password)" variant="outlined" class="form-btn" @click="login()">Login</v-btn>
            </v-row>
          </v-form>

        </v-col>

        
      </v-row>
    </v-responsive>
  </v-container>
</template>
<style>
.login-form {
  max-width: 700px !important;
  margin: auto !important;
}
.login-form .v-input__control {
  max-width: 700px !important;
}
.ital-input input:placeholder-shown {
   font-style: italic;
}
.form-btn:hover {
  background-color: #98FF86;
  color: black;
  border-color: #98FF86;
}
</style>

<script src="./js/Login.js">
  //
</script>
