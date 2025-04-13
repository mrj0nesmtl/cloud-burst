# Cloud Burst Documentation Assets

This directory contains assets used in the Cloud Burst documentation, including:

- Diagram images that are compatible with GitHub mobile
- Other documentation resources

## Diagrams

The `.md` files in this directory contain Mermaid markdown for various diagrams used in the documentation:

- `architecture-diagram.md` - System architecture diagram
- `user-flow-diagram.md` - User flow diagram  
- `project-timeline.md` - Project timeline Gantt chart

## Image Generation

To ensure diagrams render properly on GitHub mobile (which doesn't support Mermaid rendering), we need to convert these to static images:

1. Navigate to [Mermaid Live Editor](https://mermaid.live/)
2. Paste the mermaid code from one of the `.md` files
3. Export as PNG
4. Save the PNG file with the same name (e.g., `architecture-diagram.png`)

## Image Updates

When updating diagrams:

1. First update the `.md` file with your changes
2. Then regenerate the image following the steps above
3. Commit both the `.md` file and the `.png` file

## Why Both Formats?

We maintain both formats because:

- Mermaid markdown is easier to maintain and version control
- PNG images are required for GitHub mobile compatibility
- Having both allows for easier future updates

## Current Diagrams

- System Architecture: Shows the overall system components and their interactions
- User Flow: Illustrates the guest journey through the platform
- Project Timeline: Displays the development timeline with key milestones

## Using These Images

These images are referenced in the main README.md and other documentation files using standard markdown image syntax:

```markdown
![Diagram Description](docs/assets/diagram-name.png)
``` 