export type ReframerStatus =
  | "PASS"
  | "CLARIFY"
  | "SUGGEST_REFRAME"
  | "ROUTE_TO_NAVIGATOR"
  | "PREREQUISITE_REQUIRED";

export type ReframerRoute =
  | "DECISION_LANDSCAPE"
  | "NAVIGATOR"
  | "CLARIFIER"
  | "PREREQUISITE"
  | "NON_DECISION";

export type ReadinessState = "GREEN" | "AMBER" | "RED";
export type EvidenceStrength = "LOW" | "MEDIUM" | "HIGH";
export type PathId = "A" | "B" | "C";
export type DecisionKind =
  | "PURCHASE"
  | "RELOCATION"
  | "PORTFOLIO"
  | "GENERAL";

export type MoneyAmount = {
  amount: number;
  currency: "GBP" | "USD" | "EUR" | "SGD";
};

export type DecisionCore = {
  subject: string;
  kind: DecisionKind;
  commitment?: string;
  price?: MoneyAmount;
};
export type ClarifierMethod = "ISOLATION" | "THRESHOLD" | "COUNTERFACTUAL";

export type MoneyAmount = {
  amount: number;
  currency: "GBP";
};

export type DecisionContext = {
  prompt: string;
  decision: DecisionCore;
  facts: {
    userStated: {
      subject: string;
      price: MoneyAmount;
    };
    assumedForSlice: {
      marketClass: string;
      pricePosition: string;
    };
  };

  reframer?: {
    status: ReframerStatus;
    governingObjective: string;
    route: ReframerRoute;
    reason: {
      decisionCount: number;
      decisionType: string;
      subjectCount: number;
      pricePresent: boolean;
    };
  };

  landscape?: {
    v1?: {
      subject: string;
      commitment: string;
      decisionAxes: string[];
      resolvedUncertainties: string[];
      remainingUncertainties: string[];
      state: "BROAD";
    };

    v2?: {
      subject: string;
      commitment: string;
      decisionAxes: string[];
      resolvedUncertainties: string[];
      remainingUncertainties: string[];
      state: "NARROWED";
    };
  };

  panel: {
    guardian?: {
      protectedValue: string;
      concern: string;
    }[];

    pragmatist?: {
      requirement: string;
    }[];

    empathiser?: {
      humanFactor: string;
    }[];
  };

  auditor?: {
    evidenceStrength: EvidenceStrength;
    assumptions: string[];
    missingInformation: string[];
    blockingUncertainties: string[];
    supportedConclusions: {
      finding: string;
    }[];
    unsupportedConclusions: {
      finding: string;
    }[];
    internalConsistency: "CONSISTENT" | "INCONSISTENT";
    readinessScore: number;
    readinessState: ReadinessState;
  };

  clarifier?: {
    target: string;
    method: ClarifierMethod;
    question: string;
    rationale: string;
  };

  clarifierResponse?: {
    answer: string;
    effect: string;
  };

  representativePaths?: {
    id: PathId;
    title: string;
    requiredConditions: string[];
    commitment: {
      type: string;
      amount: number;
      currency: "GBP";
    };
    outcome: string;
  }[];

  eventHorizon?: {
    trigger: string;
    irreversibleAfter: string[];
    transition: string;
  };

  establishingShots?: {
    pathId: PathId;
    title?: string;
    shot: string;
  }[];

  steelman?: {
    pathId: PathId;
    objective: string;
    supportingConditions: string[];
  }[];

  presentation?: {
    decisionStateSummary?: string;
    decisionTurn?: string;
  };

  navigator?: {
    pathSelected: string;
    status: string;
    scale: "CHECKLIST" | "IMPLEMENTATION_PLAN" | "PROGRAMME_MAP";
    summary: string;
    sections: {
      title: string;
      items: string[];
    }[];
    pauseBeforeProceedingIf?: string[];
    nextAction?: string;
  };
  
  finalOutput?: string;
};