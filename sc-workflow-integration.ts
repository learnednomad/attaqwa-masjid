/**
 * SuperClaude Workflow Integration Layer
 * 
 * Integrates the /sc:workflow command with the SuperClaude ecosystem,
 * including TodoWrite, MCP servers, persona system, and quality gates.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SCWorkflowCommand, AnalyzedRequirement, Workflow, WorkflowPhase } from './sc-workflow-engine';
import { WorkflowTemplateEngine, integrateTemplatesWithWorkflow } from './sc-workflow-templates';

// ========================================================================================
// SUPERCLOUD INTEGRATION INTERFACES
// ========================================================================================

interface SuperClaudeIntegration {
  todoWriteIntegration: TodoWriteIntegration;
  personaActivation: PersonaActivationSystem;
  mcpCoordination: MCPCoordination;
  qualityGatesRunner: QualityGatesRunner;
  commandOrchestration: CommandOrchestration;
}

interface TodoWriteIntegration {
  generateTasks(workflow: Workflow): SuperClaudeTask[];
  createProgressTasks(phases: WorkflowPhase[]): SuperClaudeTask[];
  generateValidationTasks(workflow: Workflow): SuperClaudeTask[];
}

interface SuperClaudeTask {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime?: string;
  persona?: string;
  mcpServers?: string[];
  commands?: string[];
  islamicConsiderations?: string[];
}

interface PersonaActivationSystem {
  analyzeRequirements(requirements: AnalyzedRequirement[]): PersonaRecommendation[];
  activatePersonas(workflow: Workflow): PersonaActivation[];
  getPersonaCommands(persona: string, context: string): string[];
}

interface PersonaRecommendation {
  persona: string;
  confidence: number;
  reason: string;
  applicablePhases: string[];
  mcpServers: string[];
}

interface PersonaActivation {
  persona: string;
  phases: string[];
  commands: string[];
  islamicContext: boolean;
}

interface MCPCoordination {
  selectServers(workflow: Workflow): MCPServerSelection[];
  generateServerCommands(workflow: Workflow): MCPCommand[];
  optimizeServerUsage(workflow: Workflow): MCPOptimization;
}

interface MCPServerSelection {
  server: string;
  reason: string;
  phases: string[];
  confidence: number;
}

interface MCPCommand {
  server: string;
  phase: string;
  commands: string[];
  context: string;
}

interface MCPOptimization {
  parallelizable: string[];
  sequential: string[];
  caching: string[];
  recommendations: string[];
}

interface QualityGatesRunner {
  generateQualityTasks(workflow: Workflow): SuperClaudeTask[];
  createValidationWorkflow(workflow: Workflow): ValidationWorkflow;
  getIslamicComplianceChecks(workflow: Workflow): IslamicComplianceCheck[];
}

interface ValidationWorkflow {
  phases: ValidationPhase[];
  culturalValidation: CulturalValidation[];
  technicalValidation: TechnicalValidation[];
}

interface ValidationPhase {
  name: string;
  checks: string[];
  persona: string;
  tools: string[];
  commands: string[];
}

interface CulturalValidation {
  area: string;
  requirements: string[];
  validationSteps: string[];
  commands: string[];
}

interface TechnicalValidation {
  area: string;
  checks: string[];
  tools: string[];
  commands: string[];
}

interface IslamicComplianceCheck {
  category: string;
  requirements: string[];
  validationCommands: string[];
  culturalExpert: boolean;
}

interface CommandOrchestration {
  generateWorkflowCommands(workflow: Workflow): OrchestrationPlan;
  createExecutionPlan(workflow: Workflow): ExecutionPlan;
  generateSuperClaudeScript(workflow: Workflow): string;
}

interface OrchestrationPlan {
  phases: OrchestrationPhase[];
  parallelization: ParallelizationPlan;
  dependencies: DependencyGraph;
}

interface OrchestrationPhase {
  name: string;
  commands: string[];
  personas: string[];
  mcpServers: string[];
  estimatedDuration: string;
}

interface ParallelizationPlan {
  parallelizable: string[][];
  sequential: string[];
  bottlenecks: string[];
}

interface DependencyGraph {
  nodes: string[];
  edges: { from: string; to: string; type: string }[];
}

interface ExecutionPlan {
  steps: ExecutionStep[];
  checkpoints: string[];
  rollbackPoints: string[];
}

interface ExecutionStep {
  id: string;
  command: string;
  prerequisites: string[];
  validation: string[];
  rollback: string[];
}

// ========================================================================================
// SUPERCLOUD INTEGRATION IMPLEMENTATION
// ========================================================================================

export class SuperClaudeWorkflowIntegration implements SuperClaudeIntegration {
  public todoWriteIntegration: TodoWriteIntegration;
  public personaActivation: PersonaActivationSystem;
  public mcpCoordination: MCPCoordination;
  public qualityGatesRunner: QualityGatesRunner;
  public commandOrchestration: CommandOrchestration;

  constructor() {
    this.todoWriteIntegration = new TodoWriteIntegrationImpl();
    this.personaActivation = new PersonaActivationSystemImpl();
    this.mcpCoordination = new MCPCoordinationImpl();
    this.qualityGatesRunner = new QualityGatesRunnerImpl();
    this.commandOrchestration = new CommandOrchestrationImpl();
  }
}

// ========================================================================================
// TODO WRITE INTEGRATION
// ========================================================================================

class TodoWriteIntegrationImpl implements TodoWriteIntegration {
  generateTasks(workflow: Workflow): SuperClaudeTask[] {
    console.log('📝 Generating TodoWrite tasks from workflow...');
    
    const tasks: SuperClaudeTask[] = [];

    // Add workflow overview task
    tasks.push({
      content: `Execute ${workflow.title} using ${workflow.strategy} strategy`,
      status: 'pending',
      priority: 'critical',
      estimatedTime: `${Math.ceil(workflow.totalEstimate.realistic / 8)} days`,
      persona: 'architect',
      mcpServers: ['sequential'],
      commands: [
        `/sc:workflow --strategy=${workflow.strategy}`,
        'Review workflow phases and dependencies',
        'Set up project structure and tools'
      ]
    });

    // Add phase-specific tasks
    workflow.phases.forEach((phase, index) => {
      tasks.push({
        content: `Phase ${index + 1}: ${phase.name} - ${phase.description}`,
        status: 'pending',
        priority: index === 0 ? 'high' : 'medium',
        estimatedTime: `${Math.ceil(phase.duration.realistic / 8)} days`,
        persona: phase.personas[0] || 'architect',
        mcpServers: phase.mcpServers,
        commands: this.generatePhaseCommands(phase),
        islamicConsiderations: phase.islamicConsiderations
      });

      // Add deliverable tasks
      phase.deliverables.forEach(deliverable => {
        tasks.push({
          content: `Complete deliverable: ${deliverable}`,
          status: 'pending',
          priority: 'medium',
          persona: this.selectPersonaForDeliverable(deliverable, phase.personas),
          mcpServers: phase.mcpServers
        });
      });

      // Add quality gate tasks
      phase.qualityGates.forEach(gate => {
        tasks.push({
          content: `Quality Gate: ${gate}`,
          status: 'pending',
          priority: 'high',
          persona: 'qa',
          commands: [`Validate: ${gate}`, 'Run quality checks', 'Document results']
        });
      });
    });

    console.log(`✅ Generated ${tasks.length} TodoWrite tasks`);
    return tasks;
  }

  createProgressTasks(phases: WorkflowPhase[]): SuperClaudeTask[] {
    return phases.map((phase, index) => ({
      content: `Track progress for ${phase.name}`,
      status: 'pending',
      priority: 'low',
      persona: 'analyzer',
      commands: [
        'Monitor phase completion',
        'Update stakeholders on progress',
        'Identify and escalate blockers'
      ]
    }));
  }

  generateValidationTasks(workflow: Workflow): SuperClaudeTask[] {
    const validationTasks: SuperClaudeTask[] = [];

    // Islamic compliance validation
    if (workflow.culturalCompliance.length > 0) {
      validationTasks.push({
        content: 'Validate Islamic cultural compliance across all features',
        status: 'pending',
        priority: 'critical',
        persona: 'scribe',
        commands: [
          'Review all Islamic content for authenticity',
          'Validate Arabic text and RTL support',
          'Check cultural sensitivity guidelines',
          'Conduct community review process'
        ],
        islamicConsiderations: [
          'Islamic scholar review required',
          'Community feedback collection',
          'Cultural authenticity validation'
        ]
      });
    }

    // Technical validation
    validationTasks.push({
      content: 'Execute comprehensive technical validation',
      status: 'pending',
      priority: 'high',
      persona: 'qa',
      mcpServers: ['playwright', 'sequential'],
      commands: [
        '/sc:test --comprehensive',
        'Run performance benchmarks',
        'Validate accessibility compliance',
        'Execute security audit'
      ]
    });

    return validationTasks;
  }

  private generatePhaseCommands(phase: WorkflowPhase): string[] {
    const commands: string[] = [];
    
    // Add persona-specific commands
    phase.personas.forEach(persona => {
      switch (persona) {
        case 'frontend':
          commands.push(`/sc:implement --persona-frontend --magic`);
          break;
        case 'backend':
          commands.push(`/sc:implement --persona-backend --c7`);
          break;
        case 'architect':
          commands.push(`/sc:design --persona-architect --seq`);
          break;
        case 'security':
          commands.push(`/sc:analyze --focus security --persona-security`);
          break;
        default:
          commands.push(`/sc:implement --persona-${persona}`);
      }
    });

    // Add MCP server commands
    if (phase.mcpServers.includes('magic')) {
      commands.push('Generate UI components with Magic MCP');
    }
    if (phase.mcpServers.includes('context7')) {
      commands.push('Reference documentation with Context7 MCP');
    }
    if (phase.mcpServers.includes('sequential')) {
      commands.push('Use Sequential MCP for complex analysis');
    }

    return commands;
  }

  private selectPersonaForDeliverable(deliverable: string, availablePersonas: string[]): string {
    const lowerDeliverable = deliverable.toLowerCase();
    
    if (lowerDeliverable.includes('ui') || lowerDeliverable.includes('component')) {
      return availablePersonas.includes('frontend') ? 'frontend' : 'architect';
    }
    if (lowerDeliverable.includes('api') || lowerDeliverable.includes('database')) {
      return availablePersonas.includes('backend') ? 'backend' : 'architect';
    }
    if (lowerDeliverable.includes('test') || lowerDeliverable.includes('quality')) {
      return 'qa';
    }
    if (lowerDeliverable.includes('security')) {
      return 'security';
    }
    
    return availablePersonas[0] || 'architect';
  }
}

// ========================================================================================
// PERSONA ACTIVATION SYSTEM
// ========================================================================================

class PersonaActivationSystemImpl implements PersonaActivationSystem {
  private personaPatterns = {
    frontend: ['ui', 'interface', 'component', 'responsive', 'mobile', 'css', 'design'],
    backend: ['api', 'database', 'server', 'endpoint', 'authentication', 'microservice'],
    architect: ['architecture', 'system design', 'scalability', 'infrastructure', 'patterns'],
    security: ['security', 'authentication', 'authorization', 'vulnerability', 'compliance'],
    analyzer: ['analyze', 'investigate', 'troubleshoot', 'debug', 'performance'],
    qa: ['test', 'quality', 'validation', 'verification', 'coverage'],
    scribe: ['documentation', 'content', 'arabic', 'translation', 'cultural'],
    performance: ['optimization', 'speed', 'cache', 'benchmark', 'scalability'],
    devops: ['deployment', 'infrastructure', 'monitoring', 'cicd', 'automation']
  };

  analyzeRequirements(requirements: AnalyzedRequirement[]): PersonaRecommendation[] {
    console.log('👥 Analyzing persona requirements...');
    
    const recommendations: PersonaRecommendation[] = [];
    const allText = requirements.map(req => req.originalText.toLowerCase()).join(' ');

    Object.entries(this.personaPatterns).forEach(([persona, patterns]) => {
      const matches = patterns.filter(pattern => allText.includes(pattern));
      const confidence = matches.length / patterns.length;

      if (confidence > 0.1) { // 10% threshold
        const reason = `Detected ${matches.length} relevant patterns: ${matches.join(', ')}`;
        const mcpServers = this.getMCPServersForPersona(persona);
        
        recommendations.push({
          persona,
          confidence,
          reason,
          applicablePhases: this.getApplicablePhases(persona),
          mcpServers
        });
      }
    });

    // Special handling for Islamic features
    const hasIslamicFeatures = requirements.some(req => req.type === 'islamic');
    if (hasIslamicFeatures) {
      recommendations.push({
        persona: 'scribe',
        confidence: 0.9,
        reason: 'Islamic content detected - cultural expertise required',
        applicablePhases: ['Cultural Implementation', 'Content Validation'],
        mcpServers: ['context7']
      });
    }

    const sortedRecommendations = recommendations.sort((a, b) => b.confidence - a.confidence);
    console.log(`✅ Generated ${sortedRecommendations.length} persona recommendations`);
    
    return sortedRecommendations;
  }

  activatePersonas(workflow: Workflow): PersonaActivation[] {
    const activations: PersonaActivation[] = [];
    
    workflow.phases.forEach(phase => {
      phase.personas.forEach(persona => {
        const existing = activations.find(a => a.persona === persona);
        if (existing) {
          existing.phases.push(phase.name);
        } else {
          activations.push({
            persona,
            phases: [phase.name],
            commands: this.getPersonaCommands(persona, phase.name),
            islamicContext: phase.islamicConsiderations.length > 0
          });
        }
      });
    });

    return activations;
  }

  getPersonaCommands(persona: string, context: string): string[] {
    const baseCommands: Record<string, string[]> = {
      frontend: [
        '/sc:implement --persona-frontend --magic',
        '/sc:design --focus ui --magic',
        '/sc:test --e2e --play'
      ],
      backend: [
        '/sc:implement --persona-backend --c7',
        '/sc:analyze --focus performance --seq',
        '/sc:test --api --validation'
      ],
      architect: [
        '/sc:design --persona-architect --seq --c7',
        '/sc:analyze --system-wide --ultrathink',
        '/sc:document --architecture'
      ],
      security: [
        '/sc:analyze --focus security --persona-security',
        '/sc:audit --comprehensive --validate',
        '/sc:implement --security-patterns --c7'
      ],
      scribe: [
        '/sc:document --persona-scribe --c7',
        '/sc:explain --cultural-context',
        '/sc:validate --islamic-compliance'
      ],
      qa: [
        '/sc:test --comprehensive --play',
        '/sc:validate --quality-gates',
        '/sc:analyze --coverage --performance'
      ]
    };

    return baseCommands[persona] || ['/sc:implement --persona-' + persona];
  }

  private getMCPServersForPersona(persona: string): string[] {
    const serverMap: Record<string, string[]> = {
      frontend: ['magic', 'context7'],
      backend: ['context7', 'sequential'],
      architect: ['sequential', 'context7'],
      security: ['sequential', 'context7'],
      analyzer: ['sequential'],
      qa: ['playwright', 'sequential'],
      scribe: ['context7'],
      performance: ['playwright', 'sequential'],
      devops: ['context7', 'sequential']
    };

    return serverMap[persona] || ['context7'];
  }

  private getApplicablePhases(persona: string): string[] {
    const phaseMap: Record<string, string[]> = {
      frontend: ['UI Implementation', 'Component Development', 'Responsive Design'],
      backend: ['API Development', 'Database Implementation', 'Service Integration'],
      architect: ['System Design', 'Architecture Planning', 'Technology Selection'],
      security: ['Security Implementation', 'Compliance Validation', 'Audit'],
      scribe: ['Documentation', 'Cultural Validation', 'Content Creation'],
      qa: ['Testing', 'Quality Assurance', 'Validation']
    };

    return phaseMap[persona] || ['Implementation'];
  }
}

// ========================================================================================
// MCP COORDINATION
// ========================================================================================

class MCPCoordinationImpl implements MCPCoordination {
  selectServers(workflow: Workflow): MCPServerSelection[] {
    console.log('🔗 Selecting optimal MCP servers...');
    
    const selections: MCPServerSelection[] = [];
    const serverReasons = {
      context7: 'Documentation lookup and framework patterns needed',
      sequential: 'Complex multi-step analysis required',
      magic: 'UI component generation and design system work',
      playwright: 'End-to-end testing and browser automation needed'
    };

    // Analyze workflow for server needs
    const hasUIWork = workflow.phases.some(phase => 
      phase.personas.includes('frontend') || 
      phase.name.toLowerCase().includes('ui')
    );

    const hasComplexAnalysis = workflow.phases.some(phase =>
      phase.personas.includes('architect') ||
      phase.personas.includes('analyzer') ||
      phase.name.toLowerCase().includes('analysis')
    );

    const hasTestingNeeds = workflow.phases.some(phase =>
      phase.personas.includes('qa') ||
      phase.name.toLowerCase().includes('test')
    );

    // Context7 - almost always needed for documentation
    selections.push({
      server: 'context7',
      reason: serverReasons.context7,
      phases: workflow.phases.map(p => p.name),
      confidence: 0.9
    });

    // Sequential - for complex workflows
    if (hasComplexAnalysis || workflow.strategy === 'systematic' || workflow.strategy === 'enterprise') {
      selections.push({
        server: 'sequential',
        reason: serverReasons.sequential,
        phases: workflow.phases.filter(p => 
          p.personas.includes('architect') || p.personas.includes('analyzer')
        ).map(p => p.name),
        confidence: 0.8
      });
    }

    // Magic - for UI work
    if (hasUIWork) {
      selections.push({
        server: 'magic',
        reason: serverReasons.magic,
        phases: workflow.phases.filter(p => 
          p.personas.includes('frontend')
        ).map(p => p.name),
        confidence: 0.7
      });
    }

    // Playwright - for testing
    if (hasTestingNeeds) {
      selections.push({
        server: 'playwright',
        reason: serverReasons.playwright,
        phases: workflow.phases.filter(p => 
          p.personas.includes('qa')
        ).map(p => p.name),
        confidence: 0.7
      });
    }

    console.log(`✅ Selected ${selections.length} MCP servers`);
    return selections;
  }

  generateServerCommands(workflow: Workflow): MCPCommand[] {
    const commands: MCPCommand[] = [];
    
    workflow.phases.forEach(phase => {
      phase.mcpServers.forEach(server => {
        const phaseCommands = this.getServerCommandsForPhase(server, phase);
        commands.push({
          server,
          phase: phase.name,
          commands: phaseCommands,
          context: phase.description
        });
      });
    });

    return commands;
  }

  optimizeServerUsage(workflow: Workflow): MCPOptimization {
    // Identify parallelizable server operations
    const parallelizable = workflow.phases
      .filter(phase => phase.dependencies.length === 0)
      .map(phase => phase.name);

    // Identify sequential dependencies
    const sequential = workflow.phases
      .filter(phase => phase.dependencies.length > 0)
      .map(phase => phase.name);

    // Identify caching opportunities
    const caching = [
      'Context7 documentation lookups',
      'Sequential analysis results',
      'Magic component patterns'
    ];

    const recommendations = [
      'Use parallel MCP calls for independent phases',
      'Cache Context7 results for repeated documentation lookups',
      'Batch Sequential analysis for related requirements',
      'Optimize Magic calls for similar UI components'
    ];

    return {
      parallelizable,
      sequential,
      caching,
      recommendations
    };
  }

  private getServerCommandsForPhase(server: string, phase: WorkflowPhase): string[] {
    switch (server) {
      case 'context7':
        return [
          'Look up framework documentation',
          'Find implementation patterns',
          'Get best practice examples'
        ];
      case 'sequential':
        return [
          'Analyze complex requirements',
          'Break down implementation steps',
          'Evaluate architectural decisions'
        ];
      case 'magic':
        return [
          'Generate UI components',
          'Create design system elements',
          'Build responsive layouts'
        ];
      case 'playwright':
        return [
          'Create E2E test scenarios',
          'Validate user workflows',
          'Test cross-browser compatibility'
        ];
      default:
        return ['Execute phase-specific operations'];
    }
  }
}

// ========================================================================================
// QUALITY GATES RUNNER
// ========================================================================================

class QualityGatesRunnerImpl implements QualityGatesRunner {
  generateQualityTasks(workflow: Workflow): SuperClaudeTask[] {
    console.log('🛡️ Generating quality gate tasks...');
    
    const qualityTasks: SuperClaudeTask[] = [];

    // Add standard quality gates
    qualityTasks.push({
      content: 'Execute code quality validation',
      status: 'pending',
      priority: 'high',
      persona: 'qa',
      commands: [
        'npm run lint',
        'npm run typecheck',
        'npm run test:coverage',
        'Check test coverage >80%'
      ]
    });

    // Add performance validation
    qualityTasks.push({
      content: 'Validate performance requirements',
      status: 'pending',
      priority: 'high',
      persona: 'performance',
      mcpServers: ['playwright'],
      commands: [
        '/sc:test --performance --play',
        'Run Lighthouse audits',
        'Validate Core Web Vitals',
        'Check bundle size limits'
      ]
    });

    // Add accessibility validation
    qualityTasks.push({
      content: 'Validate accessibility compliance (WCAG 2.1 AA)',
      status: 'pending',
      priority: 'high',
      persona: 'qa',
      mcpServers: ['playwright'],
      commands: [
        '/sc:test --accessibility --play',
        'Run axe-core accessibility tests',
        'Validate keyboard navigation',
        'Test screen reader compatibility'
      ]
    });

    // Add Islamic compliance validation if applicable
    if (workflow.culturalCompliance.length > 0) {
      qualityTasks.push({
        content: 'Validate Islamic cultural compliance',
        status: 'pending',
        priority: 'critical',
        persona: 'scribe',
        commands: [
          'Review Islamic content authenticity',
          'Validate Arabic text and RTL support',
          'Check cultural sensitivity guidelines',
          'Conduct community review'
        ],
        islamicConsiderations: [
          'Islamic scholar review required',
          'Community feedback essential',
          'Cultural authenticity validation'
        ]
      });
    }

    console.log(`✅ Generated ${qualityTasks.length} quality gate tasks`);
    return qualityTasks;
  }

  createValidationWorkflow(workflow: Workflow): ValidationWorkflow {
    const phases: ValidationPhase[] = [
      {
        name: 'Technical Validation',
        checks: ['Code quality', 'Type safety', 'Test coverage', 'Performance'],
        persona: 'qa',
        tools: ['eslint', 'typescript', 'jest', 'lighthouse'],
        commands: [
          'npm run lint',
          'npm run typecheck', 
          'npm run test:coverage',
          '/sc:test --performance'
        ]
      },
      {
        name: 'Security Validation',
        checks: ['Vulnerability scan', 'Authentication', 'Data protection'],
        persona: 'security',
        tools: ['security scanners', 'penetration testing'],
        commands: [
          '/sc:analyze --focus security',
          'Run security audit',
          'Validate authentication flows'
        ]
      }
    ];

    const culturalValidation: CulturalValidation[] = [];
    const technicalValidation: TechnicalValidation[] = [
      {
        area: 'Performance',
        checks: ['Load times <3s', 'Bundle size limits', 'Core Web Vitals'],
        tools: ['lighthouse', 'webpack-bundle-analyzer'],
        commands: ['/sc:test --performance', 'Analyze bundle size']
      }
    ];

    // Add cultural validation if Islamic features present
    if (workflow.culturalCompliance.length > 0) {
      culturalValidation.push({
        area: 'Islamic Compliance',
        requirements: ['Cultural authenticity', 'Religious accuracy', 'Community standards'],
        validationSteps: ['Scholar review', 'Community feedback', 'Authenticity check'],
        commands: ['/sc:validate --islamic-compliance', 'Conduct cultural review']
      });

      phases.push({
        name: 'Cultural Validation',
        checks: ['Islamic authenticity', 'Arabic text accuracy', 'Cultural sensitivity'],
        persona: 'scribe',
        tools: ['cultural review tools', 'islamic validators'],
        commands: [
          '/sc:validate --islamic-compliance',
          'Review Arabic text accuracy',
          'Validate cultural sensitivity'
        ]
      });
    }

    return {
      phases,
      culturalValidation,
      technicalValidation
    };
  }

  getIslamicComplianceChecks(workflow: Workflow): IslamicComplianceCheck[] {
    if (workflow.culturalCompliance.length === 0) {
      return [];
    }

    return [
      {
        category: 'Religious Accuracy',
        requirements: [
          'Quranic references verified',
          'Hadith authenticity confirmed',
          'Prayer times calculated accurately'
        ],
        validationCommands: [
          '/sc:validate --quran-references',
          '/sc:validate --hadith-authenticity',
          '/sc:validate --prayer-calculations'
        ],
        culturalExpert: true
      },
      {
        category: 'Cultural Sensitivity',
        requirements: [
          'Respectful Islamic terminology',
          'Appropriate imagery guidelines',
          'Inclusive representation'
        ],
        validationCommands: [
          '/sc:validate --terminology-respect',
          '/sc:validate --imagery-guidelines',
          '/sc:validate --representation-inclusivity'
        ],
        culturalExpert: true
      },
      {
        category: 'Technical Implementation',
        requirements: [
          'Arabic text RTL support',
          'Islamic calendar integration',
          'Timezone handling accuracy'
        ],
        validationCommands: [
          '/sc:test --rtl-support',
          '/sc:test --islamic-calendar',
          '/sc:test --timezone-accuracy'
        ],
        culturalExpert: false
      }
    ];
  }
}

// ========================================================================================
// COMMAND ORCHESTRATION
// ========================================================================================

class CommandOrchestrationImpl implements CommandOrchestration {
  generateWorkflowCommands(workflow: Workflow): OrchestrationPlan {
    console.log('🎼 Generating command orchestration plan...');
    
    const phases: OrchestrationPhase[] = workflow.phases.map(phase => ({
      name: phase.name,
      commands: this.generatePhaseCommands(phase),
      personas: phase.personas,
      mcpServers: phase.mcpServers,
      estimatedDuration: `${Math.ceil(phase.duration.realistic / 8)} days`
    }));

    const parallelization = this.analyzePrallelization(workflow);
    const dependencies = this.buildDependencyGraph(workflow);

    return {
      phases,
      parallelization,
      dependencies
    };
  }

  createExecutionPlan(workflow: Workflow): ExecutionPlan {
    const steps: ExecutionStep[] = [];
    
    workflow.phases.forEach((phase, index) => {
      steps.push({
        id: `phase-${index}`,
        command: `/sc:implement ${phase.name.toLowerCase().replace(/\s+/g, '-')}`,
        prerequisites: phase.dependencies,
        validation: phase.qualityGates,
        rollback: [`Rollback ${phase.name}`, 'Restore previous state']
      });
    });

    const checkpoints = workflow.phases.map(phase => `${phase.name} completed`);
    const rollbackPoints = workflow.phases.map(phase => `Before ${phase.name}`);

    return {
      steps,
      checkpoints,
      rollbackPoints
    };
  }

  generateSuperClaudeScript(workflow: Workflow): string {
    const script = [];
    
    script.push('#!/bin/bash');
    script.push('# SuperClaude Workflow Execution Script');
    script.push(`# Generated for: ${workflow.title}`);
    script.push(`# Strategy: ${workflow.strategy}`);
    script.push('');
    
    script.push('echo "🚀 Starting SuperClaude workflow execution..."');
    script.push('');

    // Add phase execution
    workflow.phases.forEach((phase, index) => {
      script.push(`echo "📋 Phase ${index + 1}: ${phase.name}"`);
      
      // Add persona activation
      if (phase.personas.length > 0) {
        script.push(`echo "👥 Activating personas: ${phase.personas.join(', ')}"`);
      }
      
      // Add MCP server setup
      if (phase.mcpServers.length > 0) {
        script.push(`echo "🔗 Using MCP servers: ${phase.mcpServers.join(', ')}"`);
      }
      
      // Add phase-specific commands
      const commands = this.generatePhaseCommands(phase);
      commands.forEach(command => {
        script.push(`echo "Executing: ${command}"`);
        script.push(`# ${command}`);
      });
      
      // Add validation
      script.push(`echo "✅ Validating ${phase.name} completion"`);
      phase.qualityGates.forEach(gate => {
        script.push(`echo "Checking: ${gate}"`);
      });
      
      script.push('');
    });

    // Add final validation
    script.push('echo "🛡️ Running final quality gates..."');
    workflow.qualityGates.forEach(gate => {
      script.push(`echo "Final check: ${gate.name}"`);
    });

    // Add Islamic compliance if applicable
    if (workflow.culturalCompliance.length > 0) {
      script.push('echo "🕌 Validating Islamic cultural compliance..."');
      workflow.culturalCompliance.forEach(compliance => {
        script.push(`echo "Cultural check: ${compliance.area}"`);
      });
    }

    script.push('');
    script.push('echo "🎉 SuperClaude workflow execution completed!"');
    
    return script.join('\n');
  }

  private generatePhaseCommands(phase: WorkflowPhase): string[] {
    const commands: string[] = [];
    
    // Add persona-specific implementation commands
    phase.personas.forEach(persona => {
      const personaFlags = this.getPersonaFlags(persona);
      const mcpFlags = phase.mcpServers.map(server => `--${server}`).join(' ');
      
      commands.push(`/sc:implement --persona-${persona} ${mcpFlags} ${personaFlags}`.trim());
    });

    // Add phase-specific commands based on deliverables
    phase.deliverables.forEach(deliverable => {
      if (deliverable.toLowerCase().includes('test')) {
        commands.push('/sc:test --comprehensive');
      }
      if (deliverable.toLowerCase().includes('documentation')) {
        commands.push('/sc:document --persona-scribe');
      }
      if (deliverable.toLowerCase().includes('api')) {
        commands.push('/sc:implement --persona-backend --c7');
      }
    });

    return commands;
  }

  private getPersonaFlags(persona: string): string {
    const flags: Record<string, string> = {
      frontend: '--magic --uc',
      backend: '--c7 --validate',
      architect: '--seq --think-hard',
      security: '--validate --safe-mode',
      qa: '--play --validate',
      scribe: '--c7',
      performance: '--play --think'
    };

    return flags[persona] || '';
  }

  private analyzePrallelization(workflow: Workflow): ParallelizationPlan {
    const parallelizable: string[][] = [];
    const sequential: string[] = [];
    const bottlenecks: string[] = [];

    // Group phases by dependencies
    const independentPhases = workflow.phases.filter(phase => phase.dependencies.length === 0);
    if (independentPhases.length > 1) {
      parallelizable.push(independentPhases.map(phase => phase.name));
    } else {
      sequential.push(...independentPhases.map(phase => phase.name));
    }

    // Identify bottlenecks (phases with many dependents)
    workflow.phases.forEach(phase => {
      const dependentCount = workflow.phases.filter(p => 
        p.dependencies.includes(phase.name)
      ).length;
      
      if (dependentCount > 2) {
        bottlenecks.push(phase.name);
      }
    });

    return {
      parallelizable,
      sequential,
      bottlenecks
    };
  }

  private buildDependencyGraph(workflow: Workflow): DependencyGraph {
    const nodes = workflow.phases.map(phase => phase.name);
    const edges: { from: string; to: string; type: string }[] = [];

    workflow.phases.forEach(phase => {
      phase.dependencies.forEach(dep => {
        edges.push({
          from: dep,
          to: phase.name,
          type: 'sequential'
        });
      });
    });

    return { nodes, edges };
  }
}

// ========================================================================================
// MAIN INTEGRATION COMMAND
// ========================================================================================

export class IntegratedSCWorkflowCommand {
  private workflowCommand: SCWorkflowCommand;
  private templateEngine: WorkflowTemplateEngine;
  private integration: SuperClaudeWorkflowIntegration;

  constructor() {
    this.workflowCommand = new SCWorkflowCommand();
    this.templateEngine = new WorkflowTemplateEngine();
    this.integration = new SuperClaudeWorkflowIntegration();
  }

  async execute(args: {
    prdPath?: string;
    prdContent?: string;
    strategy?: 'systematic' | 'agile' | 'mvp' | 'enterprise';
    outputFormat?: 'markdown' | 'tasks' | 'json' | 'script';
    title?: string;
    islamicCompliance?: boolean;
    generateTasks?: boolean;
    activatePersonas?: boolean;
  }): Promise<{
    workflow: string;
    tasks?: SuperClaudeTask[];
    personas?: PersonaActivation[];
    mcpServers?: MCPServerSelection[];
    script?: string;
  }> {
    console.log('🚀 Integrated SuperClaude Workflow Engine starting...');

    try {
      // 1. Generate base workflow
      const baseWorkflow = await this.workflowCommand.execute({
        prdPath: args.prdPath,
        prdContent: args.prdContent,
        strategy: args.strategy,
        outputFormat: 'json',
        title: args.title
      });

      const workflow = JSON.parse(baseWorkflow) as Workflow;

      // 2. Enhance with templates
      const requirements = this.extractRequirementsFromWorkflow(workflow);
      const templateIntegration = integrateTemplatesWithWorkflow(requirements, this.templateEngine);
      
      // Merge template phases
      workflow.phases.push(...templateIntegration.enhancedPhases);

      // 3. Generate TodoWrite tasks if requested
      let tasks: SuperClaudeTask[] | undefined;
      if (args.generateTasks) {
        tasks = this.integration.todoWriteIntegration.generateTasks(workflow);
        const qualityTasks = this.integration.qualityGatesRunner.generateQualityTasks(workflow);
        tasks.push(...qualityTasks);
      }

      // 4. Activate personas if requested
      let personas: PersonaActivation[] | undefined;
      if (args.activatePersonas) {
        personas = this.integration.personaActivation.activatePersonas(workflow);
      }

      // 5. Select MCP servers
      const mcpServers = this.integration.mcpCoordination.selectServers(workflow);

      // 6. Generate execution script if requested
      let script: string | undefined;
      if (args.outputFormat === 'script') {
        script = this.integration.commandOrchestration.generateSuperClaudeScript(workflow);
      }

      // 7. Format final output
      let finalWorkflow: string;
      switch (args.outputFormat) {
        case 'tasks':
          finalWorkflow = JSON.stringify(tasks, null, 2);
          break;
        case 'script':
          finalWorkflow = script || '';
          break;
        case 'json':
          finalWorkflow = JSON.stringify(workflow, null, 2);
          break;
        default:
          // Re-generate as markdown with enhanced information
          finalWorkflow = await this.workflowCommand.execute({
            prdContent: args.prdContent || (args.prdPath ? readFileSync(args.prdPath, 'utf-8') : ''),
            strategy: args.strategy,
            outputFormat: 'markdown',
            title: args.title
          });
      }

      console.log('✅ Integrated workflow generation completed');

      return {
        workflow: finalWorkflow,
        tasks,
        personas,
        mcpServers,
        script
      };

    } catch (error) {
      console.error('❌ Integrated workflow generation failed:', error);
      throw error;
    }
  }

  private extractRequirementsFromWorkflow(workflow: Workflow): AnalyzedRequirement[] {
    // This is a simplified extraction - in a real implementation,
    // you'd store the original requirements in the workflow object
    return workflow.phases.map((phase, index) => ({
      id: `req-${index}`,
      type: 'functional' as const,
      priority: 'medium' as const,
      complexity: 0.5,
      dependencies: phase.dependencies,
      acceptanceCriteria: phase.qualityGates,
      islamicConsiderations: [],
      estimatedEffort: phase.duration,
      riskFactors: [],
      originalText: phase.description
    }));
  }
}

// Export for CLI usage
export { SuperClaudeTask, PersonaActivation, MCPServerSelection };