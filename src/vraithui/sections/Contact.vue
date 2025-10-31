<template>
  <div class="contact-container font-mono">
    <!-- Header -->
    <div class="mb-8">
      <GlitchText
        text="Contact"
        class="text-4xl font-bold text-[rgb(var(--accent))] glow-text mb-2"
      />
      <p class="text-sm opacity-70">Let's build something amazing together</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left: Contact info -->
      <div class="space-y-6">
        <!-- Terminal-style info card -->
        <div
          class="terminal-card p-6 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--panel))]"
        >
          <div class="text-xs opacity-60 mb-4">$ cat contact_info.txt</div>

          <div class="space-y-4">
            <!-- Email -->
            <div class="contact-item group">
              <div class="flex items-center gap-3">
                <div class="icon-wrapper">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs opacity-60">Email</div>
                  <a
                    href="mailto:valentingillot@gmail.com"
                    class="text-[rgb(var(--accent))] hover:underline"
                  >
                    valentingillot@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <!-- GitHub -->
            <div class="contact-item group">
              <div class="flex items-center gap-3">
                <div class="icon-wrapper">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs opacity-60">GitHub</div>
                  <a
                    href="https://github.com/Jackmaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[rgb(var(--accent))] hover:underline"
                  >
                    github.com/Jackmaa
                  </a>
                </div>
              </div>
            </div>

            <!-- LinkedIn -->
            <div class="contact-item group">
              <div class="flex items-center gap-3">
                <div class="icon-wrapper">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs opacity-60">LinkedIn</div>
                  <a
                    href="https://linkedin.com/in/valentin-gillot"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[rgb(var(--accent))] hover:underline"
                  >
                    linkedin.com/in/valentin-gillot
                  </a>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="contact-item group">
              <div class="flex items-center gap-3">
                <div class="icon-wrapper">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs opacity-60">Location</div>
                  <div class="text-[rgb(var(--fg))]">France 🇫🇷</div>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="contact-item group">
              <div class="flex items-center gap-3">
                <div class="icon-wrapper">
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="text-xs opacity-60">Status</div>
                  <div class="flex items-center gap-2">
                    <span
                      class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                    ></span>
                    <span class="text-green-400"
                      >Available for opportunities</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="space-y-3">
          <a href="mailto:valentingillot@gmail.com" class="action-button group">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send me an email
            <svg
              class="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>

          <a
            href="https://github.com/Jackmaa"
            target="_blank"
            rel="noopener noreferrer"
            class="action-button group"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            Check my GitHub
            <svg
              class="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      <!-- Right: Terminal message form -->
      <div
        class="terminal-form border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--panel))] overflow-hidden"
      >
        <!-- Terminal header -->
        <div
          class="terminal-header flex items-center gap-2 px-4 py-3 bg-[rgb(var(--panel-2))] border-b border-[rgb(var(--border))]"
        >
          <div class="flex gap-1.5">
            <div class="w-3 h-3 rounded-full bg-red-500/70"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500/70"></div>
            <div class="w-3 h-3 rounded-full bg-green-500/70"></div>
          </div>
          <div class="text-xs opacity-60 ml-2">vraith@contact:~$</div>
        </div>

        <!-- Form content -->
        <div class="p-6 space-y-6">
          <div class="text-sm opacity-70 mb-4">
            <span class="text-[rgb(var(--accent))]">#</span> Send me a message
            via terminal
          </div>

          <!-- Name input -->
          <div class="form-group">
            <label class="block text-xs opacity-60 mb-2">
              <span class="text-[rgb(var(--accent))]">$</span> name
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Your name"
              class="terminal-input"
              :class="{ 'border-red-500/50': errors.name }"
            />
            <div v-if="errors.name" class="text-xs text-red-400 mt-1">
              {{ errors.name }}
            </div>
          </div>

          <!-- Email input -->
          <div class="form-group">
            <label class="block text-xs opacity-60 mb-2">
              <span class="text-[rgb(var(--accent))]">$</span> email
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your.email@example.com"
              class="terminal-input"
              :class="{ 'border-red-500/50': errors.email }"
            />
            <div v-if="errors.email" class="text-xs text-red-400 mt-1">
              {{ errors.email }}
            </div>
          </div>

          <!-- Message textarea -->
          <div class="form-group">
            <label class="block text-xs opacity-60 mb-2">
              <span class="text-[rgb(var(--accent))]">$</span> message
            </label>
            <textarea
              v-model="form.message"
              placeholder="Your message..."
              rows="6"
              class="terminal-input resize-none"
              :class="{ 'border-red-500/50': errors.message }"
            ></textarea>
            <div v-if="errors.message" class="text-xs text-red-400 mt-1">
              {{ errors.message }}
            </div>
          </div>

          <!-- Submit button -->
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="submit-button group"
            :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }"
          >
            <span v-if="!isSubmitting">
              <span class="text-[rgb(var(--accent))]">$</span> send --message
            </span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⚙</span>
              Sending...
            </span>
            <svg
              v-if="!isSubmitting"
              class="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>

          <!-- Success message -->
          <div v-if="submitSuccess" class="terminal-output success">
            <div class="text-green-400 flex items-center gap-2">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Message sent successfully!
            </div>
            <div class="text-xs opacity-60 mt-1">
              I'll get back to you soon.
            </div>
          </div>

          <!-- Error message -->
          <div v-if="submitError" class="terminal-output error">
            <div class="text-red-400 flex items-center gap-2">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Oops! Something went wrong.
            </div>
            <div class="text-xs opacity-60 mt-1">
              Please try sending an email directly.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import GlitchText from "../effects/GlitchText.vue";

const form = reactive({
  name: "",
  email: "",
  message: "",
});

const errors = reactive({
  name: "",
  email: "",
  message: "",
});

const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref(false);

function validateForm() {
  let isValid = true;

  // Reset errors
  errors.name = "";
  errors.email = "";
  errors.message = "";

  // Validate name
  if (!form.name.trim()) {
    errors.name = "Name is required";
    isValid = false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim()) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Invalid email format";
    isValid = false;
  }

  // Validate message
  if (!form.message.trim()) {
    errors.message = "Message is required";
    isValid = false;
  } else if (form.message.trim().length < 10) {
    errors.message = "Message too short (min 10 characters)";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  submitSuccess.value = false;
  submitError.value = false;

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // Simulate API call (remplace par ton vrai endpoint)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Pour l'instant, on simule juste un succès
    // Tu peux remplacer par un vrai appel API ou mailto:
    console.log("Form submitted:", form);

    submitSuccess.value = true;

    // Reset form after 3 seconds
    setTimeout(() => {
      form.name = "";
      form.email = "";
      form.message = "";
      submitSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("Submit error:", error);
    submitError.value = true;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.contact-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glow-text {
  text-shadow: 0 0 10px rgba(var(--accent), 0.5);
}

.contact-item {
  transition: all 0.2s ease;
}

.contact-item:hover {
  transform: translateX(4px);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(var(--accent), 0.1);
  color: rgb(var(--accent));
  transition: all 0.2s ease;
}

.contact-item:hover .icon-wrapper {
  background: rgba(var(--accent), 0.2);
  box-shadow: 0 0 12px rgba(var(--accent), 0.3);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  border: 1px solid rgb(var(--border));
  border-radius: 8px;
  background: rgb(var(--panel));
  color: rgb(var(--fg));
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-button:hover {
  border-color: rgb(var(--accent));
  background: rgba(var(--accent), 0.05);
  box-shadow: 0 0 12px rgba(var(--accent), 0.2);
}

.terminal-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgb(var(--border));
  border-radius: 6px;
  color: rgb(var(--fg));
  font-family: "JetBrains Mono", monospace;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  outline: none;
}

.terminal-input:focus {
  border-color: rgb(var(--accent));
  box-shadow: 0 0 0 2px rgba(var(--accent), 0.1);
}

.terminal-input::placeholder {
  color: rgb(var(--fg));
  opacity: 0.3;
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: rgb(var(--accent));
  color: rgb(var(--bg));
  border: none;
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--accent), 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.terminal-output {
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  animation: slideIn 0.3s ease-out;
}

.terminal-output.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.terminal-output.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
