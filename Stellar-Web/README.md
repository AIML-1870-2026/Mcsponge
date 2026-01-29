# Stellar Web

An interactive network visualization featuring floating nodes that dynamically connect when within proximity of each other.

## Live Demo

[https://aiml-1870-2026.github.io/Mcsponge/Stellar-Web/](https://aiml-1870-2026.github.io/Mcsponge/Stellar-Web/)

## Features

- **Dynamic Nodes**: Light blue glowing nodes float and bounce around the canvas
- **Proximity-Based Connections**: Edges automatically form between nodes within a configurable radius
- **Variable Node Sizes**: Nodes have randomized sizes with opacity tied to size (smaller = more transparent)
- **Real-Time Statistics**: Network metrics update live as the visualization runs

## Controls

The collapsible side panel includes sliders for:

| Control | Range | Description |
|---------|-------|-------------|
| Node Speed | 0.1 - 5 | How fast nodes move |
| Node Count | 10 - 200 | Total number of nodes |
| Node Size | 1 - 10 | Base size multiplier for nodes |
| Connectivity Radius | 50 - 300 | Distance threshold for edge connections |
| Edge Thickness | 0.5 - 4 | Line width of connecting edges |

## Network Statistics

- **Total Edges**: Current number of active connections
- **Avg Connections**: Average connections per node
- **Network Density**: Percentage of possible connections that exist

## Technologies

- HTML5 Canvas
- Vanilla JavaScript
- CSS3 (backdrop blur, transitions)

## Author

Mcsponge - AIML 1870
