# Aisle - AI-Powered Wedding Planning Assistant

An AI agent that automates the wedding venue and catering discovery process, saving couples 20+ hours of repetitive research and communication.

## Project Overview

Aisle is an AI-powered platform that helps couples efficiently find and evaluate wedding venues and caterers by:
- Capturing wedding criteria through natural conversation
- Automatically discovering and filtering hundreds of potential venues
- Handling email communication with vendors on your behalf
- Extracting and organizing information from PDFs and brochures
- Creating a consolidated dashboard for decision-making
- Scheduling venue viewings automatically

**Read the full vision:** [PRD.md](./PRD.md)

---

## Getting Started for Team Members

### Prerequisites

1. **Git** - For version control
2. **Claude Code CLI** - Our primary development tool
3. **GitHub Account** - With access to this repository

### Step 1: Install Claude Code

If you don't have Claude Code installed yet:

**MacOS/Linux:**
```bash
curl -fsSL https://claude.ai/install.sh | sh
```

**Or using Homebrew:**
```bash
brew install anthropics/claude/claude
```

**Verify installation:**
```bash
claude --version
```

### Step 2: Authenticate Claude Code

```bash
claude auth login
```

This will open your browser to authenticate with your Claude account.

### Step 3: Clone the Repository

**Using SSH (Recommended):**
```bash
git clone git@github.com:saurabhbains/aisle.git
cd aisle
```

**Using HTTPS:**
```bash
git clone https://github.com/saurabhbains/aisle.git
cd aisle
```

### Step 4: Start Claude Code in the Project

```bash
cd aisle
claude
```

This will start an interactive session with Claude in the context of the project directory.

### Step 5: Tell Claude to Read the PRD

Once Claude Code is running, you can type:

```
Read the PRD.md file and familiarize yourself with the project. This is a wedding planning AI assistant we're building.
```

Claude will read the entire PRD and understand the project context.

---

## Alternative: Using Claude Desktop App

If you prefer the desktop app over the CLI:

1. **Download Claude Desktop App** from https://claude.ai/download
2. **Open the app** and switch to the **"Code"** tab
3. **Select folder:** Click "Select folder" and choose the `aisle` directory
4. **Start working:** Ask Claude to read the PRD and start building

---

## Project Structure

```
aisle/
├── PRD.md                 # Product Requirements Document
├── README.md             # This file
├── docs/                 # Additional documentation (coming soon)
├── src/                  # Source code (coming soon)
└── tests/                # Test files (coming soon)
```

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create a branch for your work:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start Claude Code:**
   ```bash
   claude
   ```

4. **Work on your feature** with Claude's assistance

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

6. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub for review

### Working with Claude Code

**Best Practices:**

- **Be specific:** Tell Claude exactly what you want to build
- **Reference the PRD:** When working on features, reference specific sections
  - Example: "Let's implement the criteria capture feature described in section 6.1 of the PRD"
- **Review changes:** Always review what Claude creates before committing
- **Ask questions:** If anything is unclear, ask Claude to explain

**Example Commands:**

```
"Read the PRD section on email communication and help me design the email agent"

"Create the basic project structure for a Python backend with the components mentioned in the PRD"

"Help me implement the PDF parsing pipeline described in the technical architecture"

"Write unit tests for the criteria capture module"
```

---

## Communication & Collaboration

### Coordination

- **Before starting work:** Check with the team on Slack/WhatsApp about what you're working on
- **Avoid conflicts:** Don't work on the same files simultaneously
- **Communicate blockers:** If you're stuck, share in the team chat

### Code Review

- All code changes should be reviewed by at least one other team member
- Create descriptive pull requests with context
- Link to relevant PRD sections in your PR description

### Git Commit Guidelines

**Good commit messages:**
```
Add criteria capture voice input component
Implement PDF parsing for venue brochures
Fix email template generation bug
Update PRD with technical decisions
```

**Format:**
```
Brief description of change

Longer explanation if needed, referencing PRD sections or issues.

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Tech Stack (Preliminary)

Based on the PRD, we're considering:

**Frontend:**
- React/Next.js
- Tailwind CSS for styling
- Real-time updates

**Backend:**
- Python or Node.js
- PostgreSQL for data storage
- Redis for caching/queues

**AI/ML:**
- OpenAI GPT-4 or Anthropic Claude
- LangChain for orchestration
- Custom PDF extraction pipeline

**Infrastructure:**
- AWS/Vercel for hosting
- S3 for document storage

*Note: Final decisions will be made collaboratively*

---

## Frequently Asked Questions

### Can multiple people use Claude Code on this project?

Yes! Each team member runs Claude Code on their own machine. You coordinate through Git:
- Everyone works on their own local copy
- Commit and push changes to GitHub
- Pull others' changes to stay in sync

### Do I need Claude Pro to use Claude Code?

Yes, Claude Code requires a Claude Pro subscription.

### Can I use Claude Desktop App instead of the CLI?

Yes! Both work. The CLI is more powerful for terminal operations, but the desktop app's Code mode is great for development too.

### What if I'm not comfortable with Git?

That's okay! Here are the essential commands you need:

```bash
# Get latest changes
git pull origin main

# See what you've changed
git status

# Add your changes
git add .

# Commit your changes
git commit -m "Your message here"

# Push to GitHub
git push origin your-branch-name
```

Ask Claude Code for help with Git commands - it's great at explaining them!

### How do we avoid merge conflicts?

1. Pull latest changes before starting work: `git pull origin main`
2. Work on different files when possible
3. Communicate what you're working on
4. Commit and push frequently
5. Keep pull requests small and focused

---

## Quick Start Checklist

- [ ] Install Claude Code CLI or Desktop App
- [ ] Authenticate with Claude
- [ ] Clone the repository
- [ ] Read the PRD.md file
- [ ] Set up Git with your name and email:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```
- [ ] Create a test branch and make your first commit
- [ ] Join the team communication channel
- [ ] Attend the kickoff meeting

---

## Resources

- **Full PRD:** [PRD.md](./PRD.md)
- **GitHub Repository:** https://github.com/saurabhbains/aisle
- **Claude Code Docs:** https://docs.anthropic.com/claude/docs/claude-code
- **Team Chat:** [Add your Slack/Discord/WhatsApp link]

---

## Need Help?

- **For technical issues:** Ask in the team chat
- **For Git questions:** Ask Claude Code or check [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- **For Claude Code issues:** Check the [official documentation](https://docs.anthropic.com/claude/docs/claude-code)

---

## License

*To be determined*

---

## Team

- Saurabh Bains - [@saurabhbains](https://github.com/saurabhbains)
- [Add other team members]

---

**Let's build something amazing! 🚀**
