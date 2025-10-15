// Performance Optimizations and Template Inheritance for Question Generation
// Provides caching, template inheritance, and scaling optimizations

import { QuestionStyle, QuestionPattern, QUESTION_PATTERNS } from './questionPatterns';
import { ExamProfile, ExamObjective } from './certifications';

// Template cache for improved performance
const templateCache = new Map<string, CachedTemplate>();
const cacheExpiryMs = 60 * 60 * 1000; // 1 hour
interface CachedTemplate {
  template: string;
  timestamp: number;
  examId: string;
  style: QuestionStyle;
}

// Pattern inheritance system for similar exam types
export interface ExamTypeFamily {
  id: string;
  name: string;
  basePatterns: Record<QuestionStyle, QuestionPattern>;
  examIds: string[];
  sharedContext?: string;
}

// Define exam families for template inheritance
export const EXAM_FAMILIES: Record<string, ExamTypeFamily> = {
  'cfa-series': {
    id: 'cfa-series',
    name: 'CFA Institute Examinations',
    examIds: ['cfa-l1', 'cfa-l2', 'cfa-l3'],
    basePatterns: {
      direct: {
        ...QUESTION_PATTERNS.direct,
        promptTemplate: `Create a DIRECT question focused on CFA curriculum concepts.

CFA DIRECT QUESTION REQUIREMENTS:
- Test knowledge of definitions, formulas, standards, or principles
- Use CFA Institute terminology and Learning Outcome Statements (LOS)
- Keep to 1 sentence maximum, no scenarios or cases
- Focus on Code of Ethics, quantitative methods, or investment analysis
- NO fictional companies or analyst scenarios

PREFERRED CFA FORMATS:
- "According to CFA Institute Standards, what is required for...?"
- "The formula for [metric] is...?"
- "Which GIPS requirement applies to...?"
- "What is the primary difference between [concept A] and [concept B]?"

CFA TERMINOLOGY FOCUS:
- Standards of Professional Conduct
- Investment analysis principles  
- Portfolio management concepts
- Financial reporting standards`
      },
      scenario: {
        ...QUESTION_PATTERNS.scenario,
        promptTemplate: `Create a SHORT SCENARIO question for CFA curriculum application.

CFA SCENARIO REQUIREMENTS:
- 2-3 sentences maximum with specific financial parameters
- Test practical application of CFA concepts
- Include realistic financial data (returns, ratios, values)
- Focus on investment decision-making or analysis
- Use professional but generic contexts

CFA SCENARIO FORMATS:
- "A portfolio has [specific metrics]. What does this indicate?"
- "An analyst calculates [specific ratio]. What conclusion should be drawn?"
- "Given [market conditions], which [principle/method] applies?"
- "A violation of [specific standard] occurs when...?"

AVOID in CFA scenarios:
- Lengthy company backgrounds
- Personal investor stories
- Non-financial context details`
      },
      case_study: QUESTION_PATTERNS.case_study // Use base case study pattern
    },
    sharedContext: 'CFA Institute curriculum context with emphasis on ethical standards, investment analysis, and professional conduct'
  },
  
  'aws-series': {
    id: 'aws-series',
    name: 'AWS Cloud Certifications',
    examIds: ['aws-cloud-practitioner', 'aws-saa', 'aws-developer', 'aws-data-analytics-specialty'],
    basePatterns: {
      direct: {
        ...QUESTION_PATTERNS.direct,
        promptTemplate: `Create a DIRECT question about AWS services and concepts.

AWS DIRECT QUESTION REQUIREMENTS:
- Test knowledge of AWS service definitions, features, or use cases
- Use official AWS terminology and service names
- Keep to 1 sentence, no implementation scenarios
- Focus on service capabilities, limits, or best practices
- NO fictional companies or complex architectures

PREFERRED AWS FORMATS:
- "What is the primary benefit of [AWS service]?"
- "Which AWS service provides [specific capability]?"
- "The maximum [limit/constraint] for [AWS service] is...?"
- "What does [AWS feature] enable?"

AWS TERMINOLOGY FOCUS:
- Well-Architected Framework principles
- Service-specific features and limits
- Security and compliance concepts
- Cost optimization principles`
      },
      scenario: {
        ...QUESTION_PATTERNS.scenario,
        promptTemplate: `Create a SHORT SCENARIO question for AWS implementation decisions.

AWS SCENARIO REQUIREMENTS:
- 2-3 sentences with specific technical requirements
- Test practical AWS service selection or configuration
- Include realistic technical constraints (SLA, scale, budget)
- Focus on architectural decisions and best practices
- Use generic but realistic business contexts

AWS SCENARIO FORMATS:
- "An application requires [specific SLA/scale]. Which AWS approach is best?"
- "A workload has [technical constraints]. What service should be used?"
- "To achieve [business requirement], which AWS pattern is appropriate?"
- "Given [compliance/security needs], what AWS configuration is recommended?"

TECHNICAL FOCUS:
- Service selection criteria
- Architecture pattern decisions
- Performance and cost optimization
- Security and compliance requirements`
      },
      case_study: QUESTION_PATTERNS.case_study
    },
    sharedContext: 'AWS cloud architecture context emphasizing Well-Architected Framework principles'
  },
  
  'enterprise-certs': {
    id: 'enterprise-certs',
    name: 'Enterprise Guild Certifications',
    examIds: ['data-engineer-cert', 'ml-engineer-cert', 'software-engineer-cert'],
    basePatterns: {
      direct: {
        ...QUESTION_PATTERNS.direct,
        promptTemplate: `Create a DIRECT question about technical engineering concepts.

ENGINEERING DIRECT QUESTION REQUIREMENTS:
- Test knowledge of technical definitions, methodologies, or tools
- Use industry-standard terminology and best practices
- Keep to 1 sentence, no implementation scenarios
- Focus on principles, patterns, or technical capabilities
- NO fictional companies or project contexts
- VARY question starters - rotate between different formats

PREFERRED ENGINEERING FORMATS (ROTATE FOR VARIETY):
- "How does [technology A] differ from [technology B]?"
- "Which characteristic defines [pattern/concept]?"
- "What distinguishes [approach X] from [approach Y]?"
- "In [context], which factor determines [outcome]?"
- "Which statement about [technology] is accurate?"
- "What happens when [condition] occurs in [system]?"

TECHNICAL FOCUS:
- Engineering best practices
- Technology capabilities and limitations
- Design patterns and methodologies
- Industry standards and frameworks`
      },
      scenario: {
        ...QUESTION_PATTERNS.scenario,
        promptTemplate: `Create a SHORT SCENARIO question for engineering decision-making.

ENGINEERING SCENARIO REQUIREMENTS:
- 2-3 sentences with specific technical requirements or constraints
- Test practical technology selection or implementation decisions  
- Include realistic technical parameters (performance, scale, reliability)
- Focus on engineering trade-offs and solution design
- Use generic but realistic technical contexts

ENGINEERING SCENARIO FORMATS:
- "A system requires [performance/scale metrics]. Which approach is optimal?"
- "Given [technical constraints], what technology choice is best?"
- "To implement [functionality] with [requirements], which pattern applies?"
- "When [technical condition] occurs, what is the recommended solution?"

TECHNICAL DECISION FOCUS:
- Architecture and design choices
- Technology stack selection
- Performance and scalability considerations
- Reliability and maintainability factors`
      },
      case_study: QUESTION_PATTERNS.case_study
    },
    sharedContext: 'Enterprise engineering context with focus on scalability, reliability, and best practices'
  }
};

export class QuestionOptimizationManager {
  
  /**
   * Get cached or generate optimized prompt template
   */
  static getOptimizedTemplate(
    examId: string,
    style: QuestionStyle,
    objective: ExamObjective
  ): string {
    const cacheKey = `${examId}_${style}_${objective.id}`;
    const cached = templateCache.get(cacheKey);
    
    // Return cached template if valid
    if (cached && (Date.now() - cached.timestamp) < cacheExpiryMs) {
      return cached.template;
    }
    
    // Generate new template using inheritance
    const template = this.generateInheritedTemplate(examId, style, objective);
    
    // Cache the result
    templateCache.set(cacheKey, {
      template,
      timestamp: Date.now(),
      examId,
      style
    });
    
    return template;
  }
  
  /**
   * Generate template using exam family inheritance
   */
  private static generateInheritedTemplate(
    examId: string,
    style: QuestionStyle,
    objective: ExamObjective
  ): string {
    // Find the exam family for this exam
    const family = Object.values(EXAM_FAMILIES).find(f => f.examIds.includes(examId));
    
    // Use family-specific patterns if available, otherwise use base patterns
    const pattern = family?.basePatterns[style] || QUESTION_PATTERNS[style];
    
    // Add objective-specific customizations
    let template = pattern.promptTemplate;
    
    // Add objective-level customizations
    if (objective.level === 'knowledge') {
      template += '\n\nKNOWLEDGE LEVEL FOCUS: Test fundamental understanding and recall of key concepts.';
    } else if (objective.level === 'application') {
      template += '\n\nAPPLICATION LEVEL FOCUS: Test practical application and problem-solving skills.';
    } else if (objective.level === 'synthesis') {
      template += '\n\nSYNTHESIS LEVEL FOCUS: Test complex analysis and integration of multiple concepts.';
    }
    
    // Add difficulty-specific guidance
    if (objective.difficulty === 'beginner') {
      template += '\n\nBEGINNER DIFFICULTY: Use clear, straightforward language and focus on basic concepts.';
    } else if (objective.difficulty === 'advanced') {
      template += '\n\nADVANCED DIFFICULTY: Include nuanced concepts and require deeper analytical thinking.';
    }
    
    // Add family context if available
    if (family?.sharedContext) {
      template += `\n\nFAMILY CONTEXT: ${family.sharedContext}`;
    }
    
    return template;
  }
  
  /**
   * Batch generate templates for multiple objectives (performance optimization)
   */
  static batchGenerateTemplates(
    examId: string,
    objectives: ExamObjective[],
    styles: QuestionStyle[]
  ): Map<string, string> {
    const results = new Map<string, string>();
    
    // Pre-warm cache for commonly used combinations
    objectives.forEach(objective => {
      styles.forEach(style => {
        const template = this.getOptimizedTemplate(examId, style, objective);
        const key = `${examId}_${style}_${objective.id}`;
        results.set(key, template);
      });
    });
    
    return results;
  }
  
  /**
   * Performance monitoring and optimization recommendations
   */
  static getPerformanceMetrics(): {
    cacheHitRate: number;
    cacheSize: number;
    mostUsedTemplates: string[];
    recommendations: string[];
  } {
    const totalRequests = templateCache.size;
    const cacheHits = Array.from(templateCache.values()).filter(
      cached => (Date.now() - cached.timestamp) < cacheExpiryMs
    ).length;
    
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
    
    // Find most frequently accessed templates
    const templateCounts = new Map<string, number>();
    Array.from(templateCache.keys()).forEach(key => {
      const examStyle = key.split('_').slice(0, 2).join('_');
      templateCounts.set(examStyle, (templateCounts.get(examStyle) || 0) + 1);
    });
    
    const mostUsed = Array.from(templateCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key);
    
    const recommendations: string[] = [];
    if (cacheHitRate < 80) {
      recommendations.push('Consider increasing cache expiry time to improve hit rate');
    }
    if (templateCache.size > 1000) {
      recommendations.push('Cache size is large, consider implementing LRU eviction');
    }
    if (mostUsed.length < 3) {
      recommendations.push('Template usage is well distributed, current setup is optimal');
    }
    
    return {
      cacheHitRate: Math.round(cacheHitRate),
      cacheSize: templateCache.size,
      mostUsedTemplates: mostUsed,
      recommendations
    };
  }
  
  /**
   * Clear cache for specific exam or all caches
   */
  static clearCache(examId?: string): number {
    if (!examId) {
      const size = templateCache.size;
      templateCache.clear();
      return size;
    }
    
    let cleared = 0;
    Array.from(templateCache.keys()).forEach(key => {
      if (key.startsWith(examId)) {
        templateCache.delete(key);
        cleared++;
      }
    });
    
    return cleared;
  }
  
  /**
   * Preload templates for an entire exam (optimization for exam sessions)
   */
  static preloadExamTemplates(examProfile: ExamProfile): Promise<void> {
    return new Promise((resolve) => {
      // Use setTimeout to avoid blocking
      setTimeout(() => {
        const allStyles: QuestionStyle[] = ['direct', 'scenario', 'case_study'];
        this.batchGenerateTemplates(examProfile.id, examProfile.objectives, allStyles);
        resolve();
      }, 0);
    });
  }
  
  /**
   * Get template inheritance tree for debugging
   */
  static getInheritanceTree(examId: string): {
    family: string | null;
    basePatterns: string[];
    inheritedCustomizations: string[];
  } {
    const family = Object.values(EXAM_FAMILIES).find(f => f.examIds.includes(examId));
    
    return {
      family: family?.name || null,
      basePatterns: family ? Object.keys(family.basePatterns) : Object.keys(QUESTION_PATTERNS),
      inheritedCustomizations: family ? [
        'Family-specific prompt templates',
        'Shared context and terminology',
        'Consistent style across exam series'
      ] : [
        'Base question patterns only'
      ]
    };
  }
  
  /**
   * Optimize question generation order for best performance
   */
  static optimizeGenerationOrder(
    requests: Array<{examId: string, objectiveId: string, style: QuestionStyle}>
  ): Array<{examId: string, objectiveId: string, style: QuestionStyle, priority: number}> {
    return requests.map(req => {
      let priority = 1;
      
      // Prioritize cached templates
      const cacheKey = `${req.examId}_${req.style}_${req.objectiveId}`;
      const cached = templateCache.get(cacheKey) as CachedTemplate | undefined;
      if (cached && (Date.now() - cached.timestamp) < cacheExpiryMs) {
        priority += 10;
      }
      
      // Prioritize direct questions (fastest to generate)
      if (req.style === 'direct') {
        priority += 5;
      }
      
      // Prioritize exams with family inheritance (more efficient)
      const family = Object.values(EXAM_FAMILIES).find(f => f.examIds.includes(req.examId));
      if (family) {
        priority += 3;
      }
      
      return { ...req, priority };
    }).sort((a, b) => b.priority - a.priority);
  }
}

// Auto-cleanup for expired cache entries
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  Array.from(templateCache.keys()).forEach(key => {
    const cached = templateCache.get(key);
    if (cached && (now - cached.timestamp) >= cacheExpiryMs) {
      templateCache.delete(key);
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired question template cache entries`);
  }
}, 30 * 60 * 1000); // Run every 30 minutes


