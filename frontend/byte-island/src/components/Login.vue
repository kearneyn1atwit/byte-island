<template>
  <v-container>
    <v-fade-transition>
      <v-alert closable @click:close="hideAlerts()" v-if="showErrorAlert" position="absolute" color="red" icon="$error" elevation="10" :text="errorAlertText" style="z-index: 9000; right: 20px; top: 20px;"></v-alert>
    </v-fade-transition> 
    <v-responsive
      class=" mx-auto"
    >
      <div class="text-center">

        <h1 class="text-h1 font-weight-bold my-10"><span style="color: #98FF86;">Byte</span> Island</h1>
      </div>

      <div class="py-4" />

      <v-row class="login-form">
        <v-col cols="12">
          <v-form v-model="valid" @submit.prevent>
            <v-text-field v-if="showUsername" v-model="username" variant="outlined" :rules="[rules.required]" placeholder="Username" class="ital-input mb-2"></v-text-field>
            <v-text-field v-model="email" variant="outlined" :rules="[rules.required]" placeholder="Email" class="ital-input mb-2"></v-text-field>
            <v-text-field :type="show ? 'text' : 'password'" :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="show = !show" v-model="password" variant="outlined" :rules="[rules.required]" placeholder="Password" class="ital-input mb-2"></v-text-field>
            <v-row align="center" justify="center" class="mt-5">
              <v-btn size="large" :disabled="!(email && password) || (showUsername && !username)" variant="outlined" class="form-btn mr-10" @click="signup()">Sign up</v-btn>
              <v-btn v-if="!showUsername" size="large" :disabled="!(email && password)" variant="outlined" class="form-btn" @click="login()">Login</v-btn>
              <v-btn v-else size="large" variant="outlined" class="form-btn-back"  @click="showUsername = false;">Back</v-btn>
            </v-row>
          </v-form>

        </v-col>
        <div class="mx-5 ml-auto mt-5"><b><i>V 1.2.0.0</i></b></div>
        
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
.form-btn-back:hover {
  background-color: #F44336;
  color: black !important;
  border-color: #F44336;
}
</style>

<script src="./js/Login.js">
  //
</script>
