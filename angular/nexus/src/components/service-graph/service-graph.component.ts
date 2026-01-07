import {
  Component,
  input,
  output,
  effect,
  signal,
  AfterViewInit,
  viewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ServiceInstance,
  ServiceDependency,
  Deployment,
  GraphNode,
  GraphEdge,
  HealthStatus
} from '../../models/service-mesh.model.js';

declare var d3: any;

@Component({
  selector: 'app-service-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-graph.component.html',
  styleUrls: ['./service-graph.component.css']
})
export class ServiceGraphComponent implements AfterViewInit {
  services = input<ServiceInstance[]>([]);
  dependencies = input<ServiceDependency[]>([]);
  deployments = input<Deployment[]>([]);
  selectedNode = output<ServiceInstance>();

  private svgRef = viewChild<ElementRef>('svgContainer');
  private initialized = signal(false);

  constructor() {
    // Set up reactive effect to update the graph when services or dependencies change
    effect(() => {
      if (this.initialized() && this.svgRef()) {
        this.updateGraph();
      }
    });
  }

  ngAfterViewInit(): void {
    // Load D3 dynamically if it's not already available
    if (typeof d3 === 'undefined') {
      this.loadD3Script().then(() => {
        setTimeout(() => {
          if (this.svgRef()) {
            this.initialized.set(true);
            this.renderGraph();
          }
        });
      }).catch(error => {
        console.error('Failed to load D3.js:', error);
      });
    } else {
      setTimeout(() => {
        if (this.svgRef()) {
          this.initialized.set(true);
          this.renderGraph();
        }
      });
    }
  }

  private async loadD3Script(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof d3 !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.onload = () => {
        // Wait a bit to ensure D3 is fully loaded
        setTimeout(() => resolve(), 100);
      };
      script.onerror = () => {
        reject(new Error('Could not load D3.js'));
      };
      document.head.appendChild(script);
    });
  }

  private renderGraph(): void {
    if (!this.initialized() || !this.svgRef() || typeof d3 === 'undefined') return;

    const svg = d3.select(this.svgRef()?.nativeElement);
    const width = parseInt(svg.style('width'));
    const height = parseInt(svg.style('height'));

    // Clear existing content
    svg.selectAll('*').remove();

    // Create force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Convert our data to graph format
    const nodes: GraphNode[] = this.createNodes();
    const links: GraphEdge[] = this.createLinks();

    // Create links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // Create nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group');

    // Add circles for nodes
    node.append('circle')
      .attr('r', 12)
      .attr('fill', (d: GraphNode) => this.getStatusColor(d.status))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', (event: any, d: any) => this.dragstarted(event, d, simulation))
        .on('drag', (event: any, d: any) => this.dragged(event, d))
        .on('end', (event: any, d: any) => this.dragended(event, d, simulation)))
      .on('click', (event: any, d: GraphNode) => {
        event.stopPropagation();
        const service = this.services().find(s => s.id === d.id);
        if (service) {
          this.selectedNode.emit(service);
        }
      });

    // Add labels to nodes
    node.append('text')
      .attr('dx', 15)
      .attr('dy', 4)
      .text((d: GraphNode) => d.name)
      .attr('font-size', '12px')
      .attr('fill', '#333');

    // Update simulation
    simulation.nodes(nodes);
    simulation.force('link').links(links);

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private updateGraph(): void {
    if (!this.initialized() || !this.svgRef()) return;

    const svg = d3.select(this.svgRef()?.nativeElement);
    const width = parseInt(svg.style('width'));
    const height = parseInt(svg.style('height'));

    // Get existing simulation if available
    // For now, we'll recreate the entire graph
    this.renderGraph();
  }

  private createNodes(): GraphNode[] {
    const services = this.services();
    const allDeployments = this.deployments();

    return services.map(service => {
      // Find all deployments for this service to determine health status
      const serviceDeployments = allDeployments.filter(d => d.service?.id === service.id);

      let status: HealthStatus = 'UNKNOWN';
      if (serviceDeployments.length > 0) {
        const healthStatuses = serviceDeployments.map(d => d.healthStatus);
        if (healthStatuses.some(s => s === 'UNHEALTHY')) {
          status = 'UNHEALTHY';
        } else if (healthStatuses.some(s => s === 'DEGRADED')) {
          status = 'DEGRADED';
        } else if (healthStatuses.every(s => s === 'HEALTHY')) {
          status = 'HEALTHY';
        }
      }

      return {
        id: service.id.toString(),
        name: service.name,
        type: 'service',
        status: status
      };
    });
  }

  private createLinks(): GraphEdge[] {
    return this.dependencies().map(dep => ({
      source: dep.sourceServiceId.toString(),
      target: dep.targetServiceId.toString(),
      type: 'dependency'
    }));
  }

  private getStatusColor(status: HealthStatus): string {
    switch (status) {
      case 'HEALTHY': return '#22c55e';
      case 'UNHEALTHY': return '#ef4444';
      case 'DEGRADED': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  private dragstarted(event: any, d: any, simulation: any): void {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: any, d: any): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragended(event: any, d: any, simulation: any): void {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}