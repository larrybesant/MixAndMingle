# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
    - img
- heading "Mix & Mingle Demo" [level=3]
- paragraph: Experience the full app in preview mode
- button "Start Demo Experience":
    - img
    - text: Start Demo Experience
- text: Or use real login
- img
- textbox "Email address"
- img
- textbox "Password"
- button:
    - img
- button "Sign In with Credentials" [disabled]
- heading "Demo Features:" [level=3]
- list:
    - listitem: • Complete user dashboard
    - listitem: • Profile setup flow
    - listitem: • Matchmaking interface
    - listitem: • Live DJ rooms
    - listitem: • Real-time messaging
- link "Forgot your password?":
    - /url: /auth/forgot-password
- paragraph:
    - text: Don't have an account?
    - link "Sign up":
        - /url: /signup
```
