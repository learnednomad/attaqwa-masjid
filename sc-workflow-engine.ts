/**
 * SuperClaude Workflow Engine - /sc:workflow Command Implementation
 * 
 * Analyzes PRDs and generates comprehensive implementation workflows
 * with Islamic cultural sensitivity and SuperClaude ecosystem integration.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// ========================================================================================
// CORE INTERFACES & TYPES
// ========================================================================================

interface AnalyzedRequirement {
  id: string;
  type: 'functional' | 'non-functional' | 'business' | 'technical' | 'islamic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  complexity: number; // 0.0-1.0
  dependencies: string[];
  acceptanceCriteria: string[];
  islamicConsiderations: IslamicContext[];
  estimatedEffort: TimeEstimate;
  riskFactors: RiskFactor[];
  originalText: string;
}

interface IslamicContext {
  type: 'prayer-times' | 'arabic-text' | 'halal-compliance' | 'hijri-calendar' | 'qibla' | 'cultural-sensitivity';
  requirements: string[];
  compliance: ComplianceRequirement[];
}

interface ComplianceRequirement {
  category: 'design' | 'content' | 'functionality' | 'accessibility';
  description: string;
  mandatory: boolean;
}

interface TimeEstimate {
  optimistic: number; // hours
  realistic: number;
  pessimistic: number;
  confidence: number; // 0.0-1.0
}

interface RiskFactor {
  category: 'technical' | 'timeline' | 'cultural' | 'integration';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0.0-1.0
  mitigation: string;
}

type WorkflowStrategy = 'systematic' | 'agile' | 'mvp' | 'enterprise';
type SuperClaudePersona = 'architect' | 'frontend' | 'backend' | 'security' | 'analyzer' | 'mentor' | 'refactorer' | 'performance' | 'qa' | 'devops' | 'scribe';

interface WorkflowPhase {
  name: string;
  description: string;
  requirements: string[];
  tasks: WorkflowTask[];
  duration: TimeEstimate;
  dependencies: string[];
  personas: SuperClaudePersona[];
  mcpServers: string[];
  deliverables: string[];
  qualityGates: string[];
  islamicConsiderations: string[];
}

interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  complexity: number;
  duration: TimeEstimate;
  dependencies: string[];
  persona: SuperClaudePersona;
  mcpServers: string[];
  tools: string[];
  acceptanceCriteria: string[];
  islamicRequirements: string[];
}

interface Workflow {
  id: string;
  title: string;
  strategy: WorkflowStrategy;
  phases: WorkflowPhase[];
  totalEstimate: TimeEstimate;
  riskAssessment: RiskAssessment;
  culturalCompliance: ComplianceCheck[];
  qualityGates: QualityGate[];
  createdAt: Date;
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationPlan: string[];
  contingencyPlans: string[];
}

interface ComplianceCheck {
  area: string;
  requirements: string[];
  validationSteps: string[];
  culturalConsiderations: string[];
}

interface QualityGate {
  name: string;
  criteria: string[];
  validationMethod: string;
  persona: SuperClaudePersona;
  tools: string[];
}

// ========================================================================================
// PRD ANALYSIS ENGINE
// ========================================================================================

class PRDAnalysisEngine {
  private islamicKeywords = [
    'prayer', 'salah', 'qibla', 'hijri', 'ramadan', 'eid', 'mosque', 'masjid',
    'quran', 'hadith', 'arabic', 'islamic', 'halal', 'imam', 'muslim', 'allah',
    'muhammad', 'sunnah', 'fiqh', 'aqidah', 'seerah', 'dhikr', 'dua'
  ];

  private complexityKeywords = {
    high: ['architecture', 'microservices', 'scalability', 'security', 'performance', 'integration', 'migration'],
    medium: ['authentication', 'api', 'database', 'frontend', 'backend', 'testing'],
    low: ['ui', 'component', 'form', 'display', 'basic', 'simple']
  };

  analyzePRD(content: string): AnalyzedRequirement[] {
    console.log('🔍 Analyzing PRD content...');
    
    const sections = this.extractSections(content);
    const requirements: AnalyzedRequirement[] = [];

    // Extract requirements from different sections
    sections.forEach((section, index) => {
      const sectionRequirements = this.extractRequirements(section, index);
      requirements.push(...sectionRequirements);
    });

    // Analyze dependencies
    this.analyzeDependencies(requirements);

    console.log(`📋 Extracted ${requirements.length} requirements`);
    return requirements;
  }

  private extractSections(content: string): string[] {
    // Split by headers (markdown format)
    const sections = content.split(/^#+\s/m).filter(section => section.trim().length > 0);
    return sections;
  }

  private extractRequirements(section: string, index: number): AnalyzedRequirement[] {
    const requirements: AnalyzedRequirement[] = [];
    
    // Look for requirement patterns
    const requirementPatterns = [
      /(?:must|should|shall|will|need to|required to)\s+(.+?)(?:\.|$)/gi,
      /(?:user|system|application|platform)\s+(?:must|should|shall|will|can)\s+(.+?)(?:\.|$)/gi,
      /(?:acceptance criteria|given|when|then):\s*(.+?)(?:\n|$)/gi,
      /[-•]\s*(.+?)(?:\n|$)/g, // Bullet points
    ];

    requirementPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(section)) !== null) {
        const reqText = match[1]?.trim();
        if (reqText && reqText.length > 10) {
          const requirement = this.createRequirement(reqText, section, index);
          requirements.push(requirement);
        }
      }
    });

    return requirements;
  }

  private createRequirement(text: string, context: string, sectionIndex: number): AnalyzedRequirement {
    const id = `req-${sectionIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    return {
      id,
      type: this.classifyRequirementType(text),
      priority: this.determinePriority(text, context),
      complexity: this.assessComplexity(text),
      dependencies: [],
      acceptanceCriteria: this.extractAcceptanceCriteria(text, context),
      islamicConsiderations: this.detectIslamicContext(text, context),
      estimatedEffort: this.estimateEffort(text),
      riskFactors: this.identifyRisks(text),
      originalText: text
    };
  }

  private classifyRequirementType(text: string): AnalyzedRequirement['type'] {
    const lowerText = text.toLowerCase();
    
    if (this.islamicKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'islamic';
    }
    if (lowerText.includes('user') || lowerText.includes('interface') || lowerText.includes('display')) {
      return 'functional';
    }
    if (lowerText.includes('performance') || lowerText.includes('security') || lowerText.includes('scalability')) {
      return 'non-functional';
    }
    if (lowerText.includes('business') || lowerText.includes('revenue') || lowerText.includes('compliance')) {
      return 'business';
    }
    return 'technical';
  }

  private determinePriority(text: string, context: string): AnalyzedRequirement['priority'] {
    const lowerText = text.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    if (lowerText.includes('critical') || lowerText.includes('must') || lowerContext.includes('core feature')) {
      return 'critical';
    }
    if (lowerText.includes('should') || lowerText.includes('important') || this.islamicKeywords.some(k => lowerText.includes(k))) {
      return 'high';
    }
    if (lowerText.includes('could') || lowerText.includes('nice to have')) {
      return 'low';
    }
    return 'medium';
  }

  private assessComplexity(text: string): number {
    const lowerText = text.toLowerCase();
    let complexity = 0.3; // base complexity
    
    // Increase complexity based on keywords
    if (this.complexityKeywords.high.some(keyword => lowerText.includes(keyword))) {
      complexity += 0.4;
    }
    if (this.complexityKeywords.medium.some(keyword => lowerText.includes(keyword))) {
      complexity += 0.2;
    }
    
    // Islamic features often require cultural sensitivity (adds complexity)
    if (this.islamicKeywords.some(keyword => lowerText.includes(keyword))) {
      complexity += 0.1;
    }
    
    // Multiple integrations increase complexity
    const integrationWords = ['integrate', 'api', 'third-party', 'external'];
    if (integrationWords.some(word => lowerText.includes(word))) {
      complexity += 0.2;
    }
    
    return Math.min(complexity, 1.0);
  }

  private extractAcceptanceCriteria(text: string, context: string): string[] {
    const criteria: string[] = [];
    
    // Look for explicit acceptance criteria
    const acPatterns = [
      /given\s+(.+?)(?:when|then|$)/gi,
      /when\s+(.+?)(?:then|$)/gi,
      /then\s+(.+?)(?:\n|$)/gi,
    ];
    
    acPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(context)) !== null) {
        criteria.push(match[1].trim());
      }
    });
    
    // Add basic criteria based on requirement type
    if (text.toLowerCase().includes('display') || text.toLowerCase().includes('show')) {
      criteria.push('Information is displayed correctly');
      criteria.push('UI is responsive across devices');
    }
    
    if (this.islamicKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      criteria.push('Cultural and religious accuracy validated');
      criteria.push('Arabic text displays correctly with proper RTL support');
    }
    
    return criteria;
  }

  private detectIslamicContext(text: string, context: string): IslamicContext[] {
    const contexts: IslamicContext[] = [];
    const lowerText = text.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    // Prayer times detection
    if (lowerText.includes('prayer') || lowerText.includes('salah')) {
      contexts.push({
        type: 'prayer-times',
        requirements: [
          'Accurate prayer time calculations',
          'Multiple calculation methods support',
          'Timezone handling',
          'Location-based adjustments'
        ],
        compliance: [
          { category: 'functionality', description: 'Prayer times must be accurate to Islamic standards', mandatory: true },
          { category: 'accessibility', description: 'Support for multiple time display formats', mandatory: false }
        ]
      });
    }
    
    // Arabic text detection
    if (lowerText.includes('arabic') || lowerContext.includes('arabic')) {
      contexts.push({
        type: 'arabic-text',
        requirements: [
          'RTL text direction support',
          'Amiri font family integration',
          'Proper Unicode handling',
          'Text direction switching'
        ],
        compliance: [
          { category: 'design', description: 'Arabic text must use Amiri font family', mandatory: true },
          { category: 'accessibility', description: 'RTL text must be properly announced by screen readers', mandatory: true }
        ]
      });
    }
    
    // Qibla direction
    if (lowerText.includes('qibla') || lowerText.includes('direction')) {
      contexts.push({
        type: 'qibla',
        requirements: [
          'Accurate Qibla direction calculation',
          'Compass integration',
          'Location permission handling',
          'Magnetic declination adjustments'
        ],
        compliance: [
          { category: 'functionality', description: 'Qibla direction must be accurate within 1 degree', mandatory: true }
        ]
      });
    }
    
    return contexts;
  }

  private estimateEffort(text: string): TimeEstimate {
    const complexity = this.assessComplexity(text);
    const baseHours = 4; // minimum task size
    
    // Estimate based on complexity
    const realistic = baseHours + (complexity * 16); // 4-20 hours range
    const optimistic = realistic * 0.7;
    const pessimistic = realistic * 1.5;
    
    return {
      optimistic: Math.round(optimistic),
      realistic: Math.round(realistic),
      pessimistic: Math.round(pessimistic),
      confidence: 1 - complexity // higher complexity = lower confidence
    };
  }

  private identifyRisks(text: string): RiskFactor[] {
    const risks: RiskFactor[] = [];
    const lowerText = text.toLowerCase();
    
    // Technical risks
    if (lowerText.includes('integration') || lowerText.includes('api')) {
      risks.push({
        category: 'technical',
        description: 'External API dependency may cause integration challenges',
        impact: 'medium',
        probability: 0.4,
        mitigation: 'Implement fallback mechanisms and comprehensive error handling'
      });
    }
    
    // Cultural risks for Islamic features
    if (this.islamicKeywords.some(keyword => lowerText.includes(keyword))) {
      risks.push({
        category: 'cultural',
        description: 'Islamic feature requires cultural sensitivity and religious accuracy',
        impact: 'high',
        probability: 0.6,
        mitigation: 'Consult with Islamic scholars and conduct thorough cultural review'
      });
    }
    
    // Timeline risks for complex features
    if (this.assessComplexity(text) > 0.7) {
      risks.push({
        category: 'timeline',
        description: 'High complexity may lead to schedule delays',
        impact: 'medium',
        probability: 0.5,
        mitigation: 'Break down into smaller tasks and add buffer time'
      });
    }
    
    return risks;
  }

  private analyzeDependencies(requirements: AnalyzedRequirement[]): void {
    // Simple dependency detection based on keywords
    const dependencyMap = new Map<string, string[]>();
    
    requirements.forEach(req => {
      const deps: string[] = [];
      const lowerText = req.originalText.toLowerCase();
      
      // Find dependencies on other requirements
      requirements.forEach(otherReq => {
        if (req.id === otherReq.id) return;
        
        const otherLower = otherReq.originalText.toLowerCase();
        
        // Check for direct dependencies
        if (lowerText.includes('after') || lowerText.includes('requires') || lowerText.includes('depends on')) {
          if (this.hasSemanticSimilarity(lowerText, otherLower)) {
            deps.push(otherReq.id);
          }
        }
        
        // Infrastructure dependencies
        if (req.type === 'functional' && otherReq.type === 'technical') {
          if (lowerText.includes('database') && otherLower.includes('schema')) {
            deps.push(otherReq.id);
          }
          if (lowerText.includes('api') && otherLower.includes('endpoint')) {
            deps.push(otherReq.id);
          }
        }
      });
      
      req.dependencies = deps;
    });
  }

  private hasSemanticSimilarity(text1: string, text2: string): boolean {
    // Simple semantic similarity check
    const words1 = text1.split(/\s+/).filter(word => word.length > 3);
    const words2 = text2.split(/\s+/).filter(word => word.length > 3);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length >= 2;
  }
}

// ========================================================================================
// STRATEGY ENGINE
// ========================================================================================

class StrategyEngine {
  generateWorkflow(requirements: AnalyzedRequirement[], strategy: WorkflowStrategy, title: string = 'Implementation Workflow'): Workflow {
    console.log(`🎯 Generating ${strategy} workflow for ${requirements.length} requirements`);
    
    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      title,
      strategy,
      phases: [],
      totalEstimate: { optimistic: 0, realistic: 0, pessimistic: 0, confidence: 0 },
      riskAssessment: this.assessRisks(requirements),
      culturalCompliance: this.generateComplianceChecks(requirements),
      qualityGates: this.generateQualityGates(strategy),
      createdAt: new Date()
    };

    switch (strategy) {
      case 'systematic':
        workflow.phases = this.generateSystematicPhases(requirements);
        break;
      case 'agile':
        workflow.phases = this.generateAgilePhases(requirements);
        break;
      case 'mvp':
        workflow.phases = this.generateMVPPhases(requirements);
        break;
      case 'enterprise':
        workflow.phases = this.generateEnterprisePhases(requirements);
        break;
    }

    workflow.totalEstimate = this.calculateTotalEstimate(workflow.phases);
    
    console.log(`✅ Generated workflow with ${workflow.phases.length} phases`);
    return workflow;
  }

  private generateSystematicPhases(requirements: AnalyzedRequirement[]): WorkflowPhase[] {
    const phases: WorkflowPhase[] = [];
    
    // Phase 1: Analysis & Planning
    phases.push({
      name: 'Analysis & Planning',
      description: 'Comprehensive analysis of requirements and system design',
      requirements: requirements.filter(req => req.type === 'business' || req.type === 'technical').map(req => req.id),
      tasks: [
        {
          id: 'task-analysis-1',
          title: 'Requirements Analysis',
          description: 'Deep dive analysis of all requirements with dependency mapping',
          priority: 'critical',
          complexity: 0.6,
          duration: { optimistic: 4, realistic: 6, pessimistic: 8, confidence: 0.8 },
          dependencies: [],
          persona: 'analyzer',
          mcpServers: ['sequential'],
          tools: ['Read', 'Grep', 'TodoWrite'],
          acceptanceCriteria: [
            'All requirements documented with acceptance criteria',
            'Dependency map created and validated',
            'Risk assessment completed'
          ],
          islamicRequirements: ['Cultural sensitivity assessment completed']
        }
      ],
      duration: { optimistic: 8, realistic: 12, pessimistic: 16, confidence: 0.8 },
      dependencies: [],
      personas: ['analyzer', 'architect'],
      mcpServers: ['sequential', 'context7'],
      deliverables: ['Requirements specification', 'System architecture design'],
      qualityGates: ['Requirements review', 'Architecture validation'],
      islamicConsiderations: ['Cultural requirements identified and documented']
    });

    // Phase 2: Foundation Setup
    phases.push({
      name: 'Foundation Setup',
      description: 'Database schema, API structure, and core infrastructure',
      requirements: requirements.filter(req => req.type === 'technical').map(req => req.id),
      tasks: [],
      duration: { optimistic: 16, realistic: 24, pessimistic: 32, confidence: 0.7 },
      dependencies: ['Analysis & Planning'],
      personas: ['backend', 'architect'],
      mcpServers: ['context7', 'sequential'],
      deliverables: ['Database schema', 'API foundation', 'Authentication system'],
      qualityGates: ['Schema validation', 'API testing'],
      islamicConsiderations: ['Islamic data types and enums implemented']
    });

    // Phase 3: Core Implementation
    phases.push({
      name: 'Core Implementation', 
      description: 'Implementation of core business logic and Islamic features',
      requirements: requirements.filter(req => req.type === 'functional' || req.type === 'islamic').map(req => req.id),
      tasks: [],
      duration: { optimistic: 24, realistic: 40, pessimistic: 56, confidence: 0.6 },
      dependencies: ['Foundation Setup'],
      personas: ['frontend', 'backend'],
      mcpServers: ['magic', 'context7'],
      deliverables: ['Islamic features', 'User interfaces', 'Business logic'],
      qualityGates: ['Feature testing', 'Cultural compliance review'],
      islamicConsiderations: ['Prayer times accuracy validated', 'Arabic text properly displayed']
    });

    // Phase 4: Integration & Testing
    phases.push({
      name: 'Integration & Testing',
      description: 'Comprehensive testing and system integration',
      requirements: requirements.filter(req => req.type === 'non-functional').map(req => req.id),
      tasks: [],
      duration: { optimistic: 12, realistic: 20, pessimistic: 28, confidence: 0.7 },
      dependencies: ['Core Implementation'],
      personas: ['qa', 'performance'],
      mcpServers: ['playwright', 'sequential'],
      deliverables: ['Test suite', 'Performance benchmarks', 'Integration validation'],
      qualityGates: ['Test coverage >90%', 'Performance requirements met'],
      islamicConsiderations: ['Cultural compliance testing completed']
    });

    return phases;
  }

  private generateAgilePhases(requirements: AnalyzedRequirement[]): WorkflowPhase[] {
    // Group requirements into sprints
    const sprints = this.groupIntoSprints(requirements, 2); // 2-week sprints
    
    return sprints.map((sprintReqs, index) => ({
      name: `Sprint ${index + 1}`,
      description: `Agile sprint delivering specific user value`,
      requirements: sprintReqs.map(req => req.id),
      tasks: [],
      duration: { optimistic: 8, realistic: 10, pessimistic: 12, confidence: 0.8 },
      dependencies: index > 0 ? [`Sprint ${index}`] : [],
      personas: this.selectPersonasForRequirements(sprintReqs),
      mcpServers: ['magic', 'context7'],
      deliverables: ['Working software increment', 'Sprint demo', 'Retrospective insights'],
      qualityGates: ['Sprint review', 'Stakeholder acceptance'],
      islamicConsiderations: sprintReqs.some(req => req.type === 'islamic') ? 
        ['Islamic features culturally validated'] : []
    }));
  }

  private generateMVPPhases(requirements: AnalyzedRequirement[]): WorkflowPhase[] {
    // Focus on critical requirements only
    const criticalReqs = requirements.filter(req => 
      req.priority === 'critical' || req.priority === 'high'
    );

    return [
      {
        name: 'MVP Core Features',
        description: 'Minimum viable product with essential functionality',
        requirements: criticalReqs.map(req => req.id),
        tasks: [],
        duration: { optimistic: 16, realistic: 24, pessimistic: 32, confidence: 0.7 },
        dependencies: [],
        personas: ['frontend', 'backend'],
        mcpServers: ['magic', 'context7'],
        deliverables: ['Working MVP', 'User feedback system'],
        qualityGates: ['MVP validation', 'User acceptance'],
        islamicConsiderations: ['Core Islamic features implemented']
      },
      {
        name: 'MVP Validation & Iteration',
        description: 'User feedback collection and rapid iteration',
        requirements: [],
        tasks: [],
        duration: { optimistic: 4, realistic: 6, pessimistic: 8, confidence: 0.8 },
        dependencies: ['MVP Core Features'],
        personas: ['analyzer', 'frontend'],
        mcpServers: ['sequential'],
        deliverables: ['User feedback analysis', 'Iteration plan'],
        qualityGates: ['Feedback review', 'Next iteration planning'],
        islamicConsiderations: ['Community feedback on Islamic features collected']
      }
    ];
  }

  private generateEnterprisePhases(requirements: AnalyzedRequirement[]): WorkflowPhase[] {
    // Enterprise strategy with comprehensive governance
    return [
      {
        name: 'Enterprise Planning',
        description: 'Comprehensive planning with governance and compliance',
        requirements: requirements.filter(req => req.type === 'business').map(req => req.id),
        tasks: [],
        duration: { optimistic: 20, realistic: 30, pessimistic: 40, confidence: 0.6 },
        dependencies: [],
        personas: ['architect', 'security', 'devops'],
        mcpServers: ['sequential', 'context7'],
        deliverables: ['Enterprise architecture', 'Governance framework', 'Compliance plan'],
        qualityGates: ['Architecture review board', 'Security assessment'],
        islamicConsiderations: ['Islamic compliance framework established']
      },
      {
        name: 'Infrastructure & Security',
        description: 'Enterprise-grade infrastructure and security implementation',
        requirements: requirements.filter(req => req.type === 'technical' || req.type === 'non-functional').map(req => req.id),
        tasks: [],
        duration: { optimistic: 30, realistic: 45, pessimistic: 60, confidence: 0.5 },
        dependencies: ['Enterprise Planning'],
        personas: ['devops', 'security', 'backend'],
        mcpServers: ['context7', 'sequential'],
        deliverables: ['Production infrastructure', 'Security framework', 'Monitoring systems'],
        qualityGates: ['Security audit', 'Performance testing'],
        islamicConsiderations: ['Islamic data protection measures implemented']
      },
      {
        name: 'Feature Development',
        description: 'Staged feature development with continuous integration',
        requirements: requirements.filter(req => req.type === 'functional' || req.type === 'islamic').map(req => req.id),
        tasks: [],
        duration: { optimistic: 40, realistic: 60, pessimistic: 80, confidence: 0.6 },
        dependencies: ['Infrastructure & Security'],
        personas: ['frontend', 'backend', 'qa'],
        mcpServers: ['magic', 'context7', 'playwright'],
        deliverables: ['Feature implementations', 'Test automation', 'Documentation'],
        qualityGates: ['Code review', 'Automated testing', 'Integration testing'],
        islamicConsiderations: ['All Islamic features culturally validated']
      },
      {
        name: 'Enterprise Deployment',
        description: 'Production deployment with monitoring and support',
        requirements: [],
        tasks: [],
        duration: { optimistic: 10, realistic: 15, pessimistic: 20, confidence: 0.7 },
        dependencies: ['Feature Development'],
        personas: ['devops', 'qa'],
        mcpServers: ['sequential'],
        deliverables: ['Production deployment', 'Monitoring dashboards', 'Support documentation'],
        qualityGates: ['Deployment validation', 'Monitoring verification'],
        islamicConsiderations: ['Islamic feature monitoring established']
      }
    ];
  }

  private groupIntoSprints(requirements: AnalyzedRequirement[], sprintWeeks: number): AnalyzedRequirement[][] {
    const sprints: AnalyzedRequirement[][] = [];
    const maxSprintEffort = sprintWeeks * 40; // 40 hours per week
    
    let currentSprint: AnalyzedRequirement[] = [];
    let currentEffort = 0;
    
    // Sort by priority and dependencies
    const sortedReqs = [...requirements].sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
    
    sortedReqs.forEach(req => {
      const reqEffort = req.estimatedEffort.realistic;
      
      if (currentEffort + reqEffort > maxSprintEffort && currentSprint.length > 0) {
        sprints.push(currentSprint);
        currentSprint = [req];
        currentEffort = reqEffort;
      } else {
        currentSprint.push(req);
        currentEffort += reqEffort;
      }
    });
    
    if (currentSprint.length > 0) {
      sprints.push(currentSprint);
    }
    
    return sprints;
  }

  private selectPersonasForRequirements(requirements: AnalyzedRequirement[]): SuperClaudePersona[] {
    const personas = new Set<SuperClaudePersona>();
    
    requirements.forEach(req => {
      switch (req.type) {
        case 'functional':
          if (req.originalText.toLowerCase().includes('ui') || 
              req.originalText.toLowerCase().includes('interface')) {
            personas.add('frontend');
          } else {
            personas.add('backend');
          }
          break;
        case 'technical':
          personas.add('architect');
          personas.add('backend');
          break;
        case 'islamic':
          personas.add('scribe');
          personas.add('frontend');
          break;
        case 'non-functional':
          if (req.originalText.toLowerCase().includes('security')) {
            personas.add('security');
          } else if (req.originalText.toLowerCase().includes('performance')) {
            personas.add('performance');
          } else {
            personas.add('qa');
          }
          break;
        case 'business':
          personas.add('analyzer');
          break;
      }
    });
    
    return Array.from(personas);
  }

  private assessRisks(requirements: AnalyzedRequirement[]): RiskAssessment {
    const allRisks = requirements.flatMap(req => req.riskFactors);
    
    // Calculate overall risk
    const avgImpact = allRisks.reduce((sum, risk) => {
      const impactValue = { low: 1, medium: 2, high: 3, critical: 4 };
      return sum + impactValue[risk.impact];
    }, 0) / Math.max(allRisks.length, 1);
    
    const overallRisk = avgImpact < 1.5 ? 'low' : 
                       avgImpact < 2.5 ? 'medium' : 
                       avgImpact < 3.5 ? 'high' : 'critical';
    
    return {
      overallRisk,
      riskFactors: allRisks,
      mitigationPlan: [
        'Regular risk assessment reviews',
        'Implement fallback mechanisms for critical features',
        'Cultural review process for Islamic features',
        'Performance monitoring throughout development'
      ],
      contingencyPlans: [
        'Scope reduction plan for timeline pressures',
        'Alternative implementation approaches for high-risk features',
        'Expert consultation process for Islamic features',
        'Rollback procedures for deployment failures'
      ]
    };
  }

  private generateComplianceChecks(requirements: AnalyzedRequirement[]): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];
    
    // Islamic compliance
    const hasIslamicFeatures = requirements.some(req => req.type === 'islamic');
    if (hasIslamicFeatures) {
      checks.push({
        area: 'Islamic Cultural Compliance',
        requirements: [
          'Arabic text uses Amiri font family',
          'Prayer times are calculated accurately',
          'Islamic terminology is used respectfully',
          'Cultural sensitivity maintained throughout'
        ],
        validationSteps: [
          'Review with Islamic scholar',
          'Test Arabic text display',
          'Validate prayer time calculations',
          'Community feedback collection'
        ],
        culturalConsiderations: [
          'Respect for Islamic values and practices',
          'Accurate representation of Islamic concepts',
          'Inclusive design for diverse Muslim communities',
          'Appropriate imagery and content guidelines'
        ]
      });
    }
    
    // Technical compliance
    checks.push({
      area: 'Technical Standards',
      requirements: [
        'WCAG 2.1 AA accessibility compliance',
        'TypeScript strict mode enabled',
        'Test coverage >80%',
        'Performance budgets met'
      ],
      validationSteps: [
        'Automated accessibility testing',
        'TypeScript compilation without errors',
        'Jest test coverage reports',
        'Lighthouse performance audits'
      ],
      culturalConsiderations: []
    });
    
    return checks;
  }

  private generateQualityGates(strategy: WorkflowStrategy): QualityGate[] {
    const commonGates: QualityGate[] = [
      {
        name: 'Code Quality',
        criteria: ['TypeScript compilation', 'ESLint passing', 'Test coverage >80%'],
        validationMethod: 'Automated CI/CD pipeline',
        persona: 'qa',
        tools: ['Bash', 'jest', 'eslint']
      },
      {
        name: 'Cultural Compliance',
        criteria: ['Islamic features culturally validated', 'Arabic text properly displayed'],
        validationMethod: 'Manual review with cultural expert',
        persona: 'scribe',
        tools: ['Read', 'browser testing']
      }
    ];

    if (strategy === 'enterprise') {
      commonGates.push({
        name: 'Security Audit',
        criteria: ['Security scan passing', 'Vulnerability assessment complete'],
        validationMethod: 'Automated security scanning',
        persona: 'security',
        tools: ['security scanners', 'penetration testing']
      });
    }

    return commonGates;
  }

  private calculateTotalEstimate(phases: WorkflowPhase[]): TimeEstimate {
    const totals = phases.reduce((acc, phase) => ({
      optimistic: acc.optimistic + phase.duration.optimistic,
      realistic: acc.realistic + phase.duration.realistic,
      pessimistic: acc.pessimistic + phase.duration.pessimistic
    }), { optimistic: 0, realistic: 0, pessimistic: 0 });

    const avgConfidence = phases.reduce((acc, phase) => acc + phase.duration.confidence, 0) / phases.length;

    return {
      ...totals,
      confidence: avgConfidence
    };
  }
}

// ========================================================================================
// WORKFLOW FORMATTER & OUTPUT
// ========================================================================================

class WorkflowFormatter {
  formatAsMarkdown(workflow: Workflow): string {
    const md = [];
    
    md.push(`# ${workflow.title}`);
    md.push(`**Strategy**: ${workflow.strategy.charAt(0).toUpperCase() + workflow.strategy.slice(1)}`);
    md.push(`**Generated**: ${workflow.createdAt.toLocaleDateString()}`);
    md.push(`**Overall Risk**: ${workflow.riskAssessment.overallRisk.toUpperCase()}`);
    md.push('');
    
    // Executive Summary
    md.push('## 📋 Executive Summary');
    md.push(`This ${workflow.strategy} workflow consists of ${workflow.phases.length} phases with an estimated timeline of ${workflow.totalEstimate.realistic} hours (${Math.ceil(workflow.totalEstimate.realistic / 40)} weeks).`);
    md.push('');
    
    // Timeline Overview
    md.push('## ⏱️ Timeline Overview');
    md.push('| Phase | Duration | Dependencies | Risk Level |');
    md.push('|-------|----------|--------------|------------|');
    
    workflow.phases.forEach(phase => {
      const deps = phase.dependencies.length > 0 ? phase.dependencies.join(', ') : 'None';
      md.push(`| ${phase.name} | ${phase.duration.realistic}h | ${deps} | Medium |`);
    });
    md.push('');
    
    // Phases Detail
    workflow.phases.forEach((phase, index) => {
      md.push(`## Phase ${index + 1}: ${phase.name}`);
      md.push(phase.description);
      md.push('');
      
      md.push('### 🎯 Objectives');
      phase.deliverables.forEach(deliverable => {
        md.push(`- ${deliverable}`);
      });
      md.push('');
      
      md.push('### 👥 Team & Tools');
      md.push(`**Personas**: ${phase.personas.join(', ')}`);
      md.push(`**MCP Servers**: ${phase.mcpServers.join(', ')}`);
      md.push('');
      
      if (phase.islamicConsiderations.length > 0) {
        md.push('### 🕌 Islamic Considerations');
        phase.islamicConsiderations.forEach(consideration => {
          md.push(`- ${consideration}`);
        });
        md.push('');
      }
      
      md.push('### ✅ Quality Gates');
      phase.qualityGates.forEach(gate => {
        md.push(`- ${gate}`);
      });
      md.push('');
    });
    
    // Cultural Compliance
    if (workflow.culturalCompliance.length > 0) {
      md.push('## 🕌 Cultural Compliance Framework');
      workflow.culturalCompliance.forEach(compliance => {
        md.push(`### ${compliance.area}`);
        compliance.requirements.forEach(req => {
          md.push(`- ${req}`);
        });
        md.push('');
      });
    }
    
    // Risk Assessment
    md.push('## ⚠️ Risk Assessment');
    md.push(`**Overall Risk Level**: ${workflow.riskAssessment.overallRisk.toUpperCase()}`);
    md.push('');
    
    md.push('### Identified Risks');
    const risksByCategory = workflow.riskAssessment.riskFactors.reduce((acc, risk) => {
      if (!acc[risk.category]) acc[risk.category] = [];
      acc[risk.category].push(risk);
      return acc;
    }, {} as Record<string, RiskFactor[]>);
    
    Object.entries(risksByCategory).forEach(([category, risks]) => {
      md.push(`**${category.charAt(0).toUpperCase() + category.slice(1)} Risks**:`);
      risks.forEach(risk => {
        md.push(`- ${risk.description} (${risk.impact} impact, ${Math.round(risk.probability * 100)}% probability)`);
        md.push(`  - *Mitigation*: ${risk.mitigation}`);
      });
      md.push('');
    });
    
    // Next Steps
    md.push('## 🚀 Next Steps');
    md.push('1. Review and approve this workflow plan');
    md.push('2. Set up project infrastructure and tools');
    md.push('3. Begin Phase 1 implementation');
    md.push('4. Schedule regular progress reviews');
    md.push('');
    md.push('---');
    md.push('*Generated by SuperClaude /sc:workflow command*');
    
    return md.join('\n');
  }

  formatAsTasks(workflow: Workflow): Array<{content: string, status: 'pending', priority: string}> {
    const tasks: Array<{content: string, status: 'pending', priority: string}> = [];
    
    workflow.phases.forEach((phase, phaseIndex) => {
      // Add phase overview task
      tasks.push({
        content: `Phase ${phaseIndex + 1}: ${phase.name} - ${phase.description}`,
        status: 'pending',
        priority: 'high'
      });
      
      // Add specific deliverable tasks
      phase.deliverables.forEach(deliverable => {
        tasks.push({
          content: `Complete: ${deliverable}`,
          status: 'pending',
          priority: phaseIndex === 0 ? 'high' : 'medium'
        });
      });
      
      // Add quality gate tasks
      phase.qualityGates.forEach(gate => {
        tasks.push({
          content: `Quality Gate: ${gate}`,
          status: 'pending',
          priority: 'medium'
        });
      });
      
      // Add Islamic consideration tasks if applicable
      phase.islamicConsiderations.forEach(consideration => {
        tasks.push({
          content: `Islamic Compliance: ${consideration}`,
          status: 'pending',
          priority: 'high'
        });
      });
    });
    
    return tasks;
  }
}

// ========================================================================================
// MAIN WORKFLOW COMMAND
// ========================================================================================

export class SCWorkflowCommand {
  private analysisEngine = new PRDAnalysisEngine();
  private strategyEngine = new StrategyEngine();
  private formatter = new WorkflowFormatter();

  async execute(args: {
    prdPath?: string;
    prdContent?: string;
    strategy?: WorkflowStrategy;
    outputFormat?: 'markdown' | 'tasks' | 'json';
    title?: string;
  }): Promise<string> {
    console.log('🚀 SuperClaude Workflow Engine starting...');
    
    try {
      // 1. Get PRD content
      let prdContent = args.prdContent || '';
      if (args.prdPath && !prdContent) {
        prdContent = readFileSync(args.prdPath, 'utf-8');
      }
      
      if (!prdContent) {
        throw new Error('No PRD content provided. Please specify prdPath or prdContent.');
      }
      
      // 2. Analyze PRD
      console.log('📋 Analyzing PRD requirements...');
      const requirements = this.analysisEngine.analyzePRD(prdContent);
      
      // 3. Determine strategy
      const strategy = args.strategy || this.selectOptimalStrategy(requirements);
      console.log(`🎯 Using ${strategy} strategy`);
      
      // 4. Generate workflow
      const workflow = this.strategyEngine.generateWorkflow(
        requirements, 
        strategy, 
        args.title || 'Implementation Workflow'
      );
      
      // 5. Format output
      const outputFormat = args.outputFormat || 'markdown';
      
      switch (outputFormat) {
        case 'markdown':
          return this.formatter.formatAsMarkdown(workflow);
          
        case 'tasks':
          const tasks = this.formatter.formatAsTasks(workflow);
          return JSON.stringify(tasks, null, 2);
          
        case 'json':
          return JSON.stringify(workflow, null, 2);
          
        default:
          return this.formatter.formatAsMarkdown(workflow);
      }
      
    } catch (error) {
      console.error('❌ Workflow generation failed:', error);
      throw error;
    }
  }
  
  private selectOptimalStrategy(requirements: AnalyzedRequirement[]): WorkflowStrategy {
    const totalComplexity = requirements.reduce((sum, req) => sum + req.complexity, 0) / requirements.length;
    const criticalCount = requirements.filter(req => req.priority === 'critical').length;
    const islamicCount = requirements.filter(req => req.type === 'islamic').length;
    
    // Enterprise strategy for high complexity + many critical requirements
    if (totalComplexity > 0.7 && criticalCount > 5) {
      return 'enterprise';
    }
    
    // MVP for small scope or experimental features
    if (requirements.length <= 5 || totalComplexity < 0.4) {
      return 'mvp';
    }
    
    // Agile for moderate complexity with UI focus
    if (requirements.some(req => req.originalText.toLowerCase().includes('ui') || 
                              req.originalText.toLowerCase().includes('interface'))) {
      return 'agile';
    }
    
    // Default to systematic for balanced approach
    return 'systematic';
  }
}

// ========================================================================================
// EXAMPLE USAGE & TESTING
// ========================================================================================

if (require.main === module) {
  // Example PRD content for testing
  const examplePRD = `
# Islamic Educational Platform Enhancement

## Overview
We need to enhance our existing Islamic educational platform with new prayer time features and improved Arabic text support.

## Requirements

### Prayer Time Integration
- The system must display accurate prayer times for the user's location
- Users should be able to view prayer times in both 12-hour and 24-hour formats
- The application must support multiple prayer time calculation methods
- Prayer time notifications should be culturally appropriate

### Arabic Text Enhancement  
- The platform must properly display Arabic text with RTL support
- Arabic content should use the Amiri font family
- Users should be able to toggle between Arabic and English content
- Transliteration should be provided for Arabic terms

### User Experience
- The interface should be responsive and work on mobile devices
- Users must be able to track their progress through educational content
- The system should provide age-appropriate content filtering
- Cultural sensitivity must be maintained throughout the user experience

## Acceptance Criteria
- Given a user's location, when they view prayer times, then accurate times are displayed
- Given Arabic content, when displayed, then it uses proper RTL formatting
- Given a mobile device, when accessing the platform, then all features work correctly
- Given different age groups, when filtering content, then appropriate materials are shown

## Non-Functional Requirements
- The system must handle 1000+ concurrent users
- Prayer time calculations must be accurate within 1 minute
- Page load times should be under 3 seconds
- The platform must be accessible according to WCAG 2.1 AA standards
`;

  async function testWorkflowEngine() {
    console.log('🧪 Testing SuperClaude Workflow Engine...\n');
    
    const workflowCommand = new SCWorkflowCommand();
    
    try {
      const result = await workflowCommand.execute({
        prdContent: examplePRD,
        strategy: 'systematic',
        outputFormat: 'markdown',
        title: 'Islamic Educational Platform Enhancement'
      });
      
      console.log(result);
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  }
  
  // Run test
  testWorkflowEngine();
}