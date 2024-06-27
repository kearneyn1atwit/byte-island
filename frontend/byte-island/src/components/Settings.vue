<template>
    <div>
        <!-- CHANGE USERNAME -->
        <v-dialog v-model="showUsername" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Change Username">
                <v-card-text>
                    <h4><b>Enter new username:</b></h4>
                    <v-text-field counter="30" persistent-counter maxlength="30" variant="outlined" class="mt-3 mb-n5" placeholder="Username" persistent-placeholder v-model="newUsername"></v-text-field>
                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showUsername = false; newUsername = username"
                    ></v-btn>
                    <v-btn
                    text="Confirm"
                    variant="outlined"
                    color="primary"
                    :disabled="username === newUsername || !newUsername"
                    @click="confirmUsername()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <!-- CHANGE PASSWORD -->
        <v-dialog v-model="showPassword" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Change Password">
                <v-card-text>
                    <h4><b>Enter current password:</b></h4>
                    <v-text-field :type="showEnter ? 'text' : 'password'" :append-inner-icon="showEnter ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showEnter = !showEnter" variant="outlined" class="mt-3 mb-n5" placeholder="Current Password" persistent-placeholder v-model="enterPassword"></v-text-field>
                    <h4 class="mt-5"><b>Enter new password:</b></h4>
                    <v-text-field :type="showNew ? 'text' : 'password'" :append-inner-icon="showNew ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showNew = !showNew" variant="outlined" class="mt-3 mb-n5" placeholder="New Password" persistent-placeholder v-model="newPassword"></v-text-field>
                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showEnter = false; showNew = false; showPassword = false; enterPassword = ''; newPassword = ''"
                    ></v-btn>
                    <v-btn
                    text="Confirm"
                    variant="outlined"
                    color="primary"
                    :disabled="!newPassword || !enterPassword"
                    @click="confirmPassword()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <!-- CONFIRM PRIVATE ACCOUNT -->
        <v-dialog v-model="showPrivateDialog" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Private Account">
                <v-card-text>
                    <h4><b>Are you sure you want to make your account private?</b></h4>

                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="No"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showPrivateDialog = false;"
                    ></v-btn>
                    <v-btn
                    text="Yes"
                    variant="outlined"
                    color="primary"
                    @click="confirmPrivate()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <!-- CONFIRM PUBLICIZE ACCOUNT -->
        <v-dialog v-model="showPublicDialog" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Publicize Account">
                <v-card-text>
                    <h4><b>Are you sure you want to publicize your account?</b></h4>

                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="No"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showPublicDialog = false;"
                    ></v-btn>
                    <v-btn
                    text="Yes"
                    variant="outlined"
                    color="primary"
                    @click="confirmPublic()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <!-- CONFIRM RESET DATA -->
        <v-dialog v-model="showReset" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Reset Data">
                <v-card-text>
                    <h2 style="color: red;"><b>Are you sure you want to reset your data? This action is irreversible.</b></h2>
                    <h4 class="mt-3"><b>Enter current password:</b></h4>
                    <v-text-field :type="showEnterReset ? 'text' : 'password'" :append-inner-icon="showEnterReset ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showEnterReset = !showEnterReset" variant="outlined" class="mt-3 mb-n5" placeholder="Current Password" persistent-placeholder v-model="confirmResetPassword"></v-text-field>

                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="No"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showReset = false; showEnterReset = false; confirmResetPassword = ''"
                    ></v-btn>
                    <!-- disable if password entered is not current password (CHANGE) -->
                    <v-btn
                    :disabled="!confirmResetPassword"
                    text="Yes"
                    variant="outlined"
                    color="primary"
                    @click="confirmReset()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <!-- CONFIRM DELETE ACCOUNT -->
        <v-dialog v-model="showDelete" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Reset Data">
                <v-card-text>
                    <h2 style="color: red;"><b>Are you sure you want to delete your account? This action is irreversible.</b></h2>
                    <h4 class="mt-3"><b>Enter current password:</b></h4>
                    <v-text-field :type="showEnterDelete ? 'text' : 'password'" :append-inner-icon="showEnterDelete ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showEnterDelete = !showEnterDelete" variant="outlined" class="mt-3 mb-n5" placeholder="Current Password" persistent-placeholder v-model="confirmDeletePassword"></v-text-field>


                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="No"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showDelete = false; confirmDeletePassword = ''; showEnterDelete = false"
                    ></v-btn>
                    <!-- disable if password entered is not current password (CHANGE) -->
                    <v-btn
                    :disabled="!confirmDeletePassword"
                    text="Yes"
                    variant="outlined"
                    color="primary"
                    @click="confirmDelete()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>

        <h1 class="header-h1 ml-2 mt-0 mb-1">Settings</h1>
        <hr class="mb-3 mt-2" style="background-color: grey; border-color: grey; color: grey; height: 1px;">

        <v-btn class="ml-5 mt-3" variant="outlined" size="large" color="primary" @click="changeUsername()">
            <h1 class="mr-n2"><v-icon icon="mdi-alphabetical" class="mr-3 ml-n2 mt-n1"></v-icon>Change username</h1>
        </v-btn>
        <pre class="ml-5 mt-2" style="white-space: pre-wrap; word-wrap: break-word;">Change your username.</pre>

        <v-btn class="ml-5 mt-8" variant="outlined" size="large" color="primary" @click="changePassword()">
            <h1 class="mr-n2"><v-icon icon="mdi-security" class="mr-3 ml-n2 mt-n1"></v-icon>Change password</h1>
        </v-btn>
        <pre class="ml-5 mt-2" style="white-space: pre-wrap; word-wrap: break-word;">Change your password.</pre>

        <v-btn class="ml-5 mt-8" variant="outlined" size="large" color="primary" @click="changeAvatar()">
            <h1 class="mr-n2"><v-icon icon="mdi-image" class="mr-3 ml-n2 mt-n1"></v-icon>Change avatar</h1>
        </v-btn>
        <input type="file" accept="image/png, image/jpeg" ref="pfp" style="display: none;">
        <pre class="ml-5 mt-2" style="white-space: pre-wrap; word-wrap: break-word;">Change your profile picture.</pre>
        
        <v-btn class="ml-5 mt-8" variant="outlined" size="large" color="primary" @click="privateAccount()">
            <h1 class="mr-n2"><v-icon icon="mdi-account-lock" class="mr-3 ml-n2 mt-n1"></v-icon>Private account</h1>
        </v-btn>
        <pre class="ml-5 mt-2" style="white-space: pre-wrap; word-wrap: break-word;">Information about what privating accounts do... (show this section if account is public)</pre>

        <v-btn class="ml-5 mt-8" variant="outlined" size="large" color="primary" @click="publicAccount()">
            <h1 class="mr-n2"><v-icon icon="mdi-account-eye" class="mr-3 ml-n2 mt-n1"></v-icon>Publicize account</h1>
        </v-btn>
        <pre class="ml-5 mt-2" style="white-space: pre-wrap; word-wrap: break-word;">Information about what publicizing accounts do... (show this section if account is private)</pre>

        <v-btn class="ml-5 mt-8" variant="outlined" size="large" color="red" @click="resetData()">
            <h1 class="mr-n2"><v-icon icon="mdi-database-refresh" class="mr-3 ml-n2 mt-n1"></v-icon>Reset Data</h1>
        </v-btn>
        <pre class="ml-5 mt-2" style="white-space: pre-wrap; word-wrap: break-word;">Information about what reseting your data does...</pre>

        <v-btn class="ml-5 mt-8" variant="outlined" size="large" color="red" @click="deleteAccount()">
            <h1 class="mr-n2"><v-icon icon="mdi-account-remove" class="mr-3 ml-n2 mt-n1"></v-icon>Delete Account</h1>
        </v-btn>
        <pre class="ml-5 mt-2 mb-8" style="white-space: pre-wrap; word-wrap: break-word;">Delete your account and all data/progress associated with it.</pre>


    </div>
</template>
<style scoped>
.header-h1 {
    font-size: 2rem;
    color: rgb(152,255,134);
}
</style>
<script src="./js/Settings.js">
</script>