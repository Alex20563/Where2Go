<template>
  <div class="two-factor-setup">
    <div v-if="!isEnabled" class="setup-section">
      <h2>Настройка двухфакторной аутентификации</h2>
      <button @click="setupTwoFactor">Включить 2FA</button>
    </div>
    
    <div v-if="showQRCode" class="qr-section">
      <h3>Отсканируйте QR-код</h3>
      <div v-html="qrCodeImage"></div>
      <div class="verification">
        <input 
          v-model="verificationCode" 
          type="text" 
          placeholder="Введите код подтверждения"
        />
        <button @click="verifyCode">Подтвердить</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/auth'

export default {
  name: 'TwoFactorSetup',
  data() {
    return {
      isEnabled: false,
      showQRCode: false,
      qrCodeImage: '',
      verificationCode: '',
      secret: ''
    }
  },
  methods: {
    async setupTwoFactor() {
      try {
        const response = await api.generate2FASecret()
        this.secret = response.data.secret
        this.showQRCode = true
        this.qrCodeImage = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/Where2Go:${this.$store.state.username}?secret=${this.secret}&issuer=Where2Go`
      } catch (error) {
        console.error('Error setting up 2FA:', error)
      }
    },
    
    async verifyCode() {
      try {
        const response = await api.verify2FA(this.verificationCode)
        if (response.data.message === '2FA verification successful') {
          this.isEnabled = true
          this.showQRCode = false
          this.$emit('2fa-enabled')
        }
      } catch (error) {
        console.error('Error verifying 2FA code:', error)
      }
    }
  }
}
</script>

<style scoped>
.two-factor-setup {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.setup-section, .qr-section {
  text-align: center;
  margin-bottom: 20px;
}

.verification {
  margin-top: 20px;
}

input {
  padding: 8px;
  margin-right: 10px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
