export interface ScamSignal {
  id: string;
  label: string;
  phrase: string;
  weight: number;
}

interface Rule {
  id: string;
  label: string;
  weight: number;
  pattern: RegExp;
  skipWhenNegated?: boolean;
}

const MAX_TEXT = 5000;

const RULES: Rule[] = [
  {
    id: 'urgency',
    label: 'Pressure to act quickly',
    weight: 10,
    pattern: /\b(?:urgent(?:ly)?|immediately|act now|last chance|final notice|expires? (?:today|soon|tonight)|within \d+ (?:hours?|hrs?|minutes?|mins?))\b/gi,
  },
  {
    id: 'accountThreat',
    label: 'Threat to your account',
    weight: 20,
    pattern: /\b(?:account[^.!?\n]{0,25}(?:blocked|suspended|closed|locked|deactivated|disabled)|(?:blocked|suspended|deactivated)[^.!?\n]{0,15}account|verify your (?:account|identity|details)|update (?:your )?(?:kyc|pan|aadhaar|details)|unusual activity|suspicious activity)\b/gi,
  },
  {
    id: 'prize',
    label: 'Prize or reward offer',
    weight: 20,
    pattern: /\b(?:you(?:'ve| have)? won|congratulations[^.!?\n]{0,30}(?:won|winner|selected|prize|reward)|claim your (?:prize|reward|gift|cashback)|lottery|lucky (?:draw|winner)|free gift)\b/gi,
  },
  {
    id: 'payment',
    label: 'Asks you to pay a fee',
    weight: 25,
    pattern: /\b(?:pay(?: a| an| the)?(?: small| nominal| one-time)? (?:registration |processing |delivery |customs |security |clearance )?(?:fee|fees|charges?|deposit)|(?:registration|processing|joining|security|clearance) (?:fee|fees|charges|deposit)|advance payment|send money)\b/gi,
  },
  {
    id: 'sensitive',
    label: 'Asks for private details',
    weight: 25,
    skipWhenNegated: true,
    pattern: /\b(?:share|send|enter|tell|give|provide)\b[^.!?\n]{0,25}\b(?:otp|cvv|pin|password|card number)\b/gi,
  },
  {
    id: 'delivery',
    label: 'Delivery problem',
    weight: 15,
    pattern: /\b(?:parcel|package|courier|delivery|shipment)\b[^.!?\n]{0,40}\b(?:held|pending|failed|undelivered|on hold|customs|returned|unable to deliver)\b/gi,
  },
  {
    id: 'job',
    label: 'Too-good-to-be-true job offer',
    weight: 15,
    pattern: /\b(?:work from home|earn [^.!?\n]{0,12}(?:per day|daily|per week|a day)|no experience (?:needed|required)|part[- ]time job|guaranteed (?:job|income|salary))\b/gi,
  },
  {
    id: 'chat',
    label: 'Moves you to a chat app',
    weight: 10,
    pattern: /\b(?:contact|message|text|chat|reach)[^.!?\n]{0,20}\b(?:on|via|at|through) (?:whatsapp|telegram)\b/gi,
  },
];

const NEGATION = /(?:do not|don't|dont|never|won't|will not)\s*$/i;

export function findScamSignals(message: string): ScamSignal[] {
  const text = String(message || '').slice(0, MAX_TEXT);
  const signals: ScamSignal[] = [];

  for (const rule of RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      const index = match.index ?? 0;
      if (rule.skipWhenNegated && NEGATION.test(text.slice(Math.max(0, index - 20), index))) continue;
      signals.push({
        id: rule.id,
        label: rule.label,
        phrase: match[0].trim().slice(0, 60),
        weight: rule.weight,
      });
      break;
    }
  }

  return signals;
}

export function wordingRisk(signals: ScamSignal[]): number {
  return Math.min(70, signals.reduce((sum, s) => sum + s.weight, 0));
}