const fs = require('fs');

const rows = 8;
const cols = 38;

const ARYAN_MAP = new Set([
  // A (cols 2..7)
  '1,4', '1,5',
  '2,3', '2,4', '2,5', '2,6',
  '3,2', '3,3', '3,6', '3,7',
  '4,2', '4,3', '4,4', '4,5', '4,6', '4,7',
  '5,2', '5,3', '5,6', '5,7',
  '6,2', '6,3', '6,6', '6,7',

  // R (cols 9..14)
  '1,9', '1,10', '1,11', '1,12', '1,13',
  '2,9', '2,10', '2,13', '2,14',
  '3,9', '3,10', '3,13', '3,14',
  '4,9', '4,10', '4,11', '4,12', '4,13',
  '5,9', '5,10', '5,12', '5,13',
  '6,9', '6,10', '6,13', '6,14',

  // Y (cols 16..21)
  '1,16', '1,17', '1,20', '1,21',
  '2,16', '2,17', '2,20', '2,21',
  '3,17', '3,18', '3,19', '3,20',
  '4,18', '4,19',
  '5,18', '5,19',
  '6,18', '6,19',

  // A (cols 23..28)
  '1,25', '1,26',
  '2,24', '2,25', '2,26', '2,27',
  '3,23', '3,24', '3,27', '3,28',
  '4,23', '4,24', '4,25', '4,26', '4,27', '4,28',
  '5,23', '5,24', '5,27', '5,28',
  '6,23', '6,24', '6,27', '6,28',

  // N (cols 30..35)
  '1,30', '1,31', '1,34', '1,35',
  '2,30', '2,31', '2,32', '2,34', '2,35',
  '3,30', '3,31', '3,32', '3,33', '3,34', '3,35',
  '4,30', '4,31', '4,33', '4,34', '4,35',
  '5,30', '5,31', '5,34', '5,35',
  '6,30', '6,31', '6,34', '6,35'
]);

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" width="900" height="220">
  <style>
    .bg { fill: #050816; }
    
    /* Base inactive cubes */
    .cube {
      fill: #060919;
      stroke: rgba(0, 229, 255, 0.06);
      stroke-width: 1.2;
      rx: 3px;
    }

    /* Standard animations loop */
    @keyframes breathe {
      0%, 100% { stroke: rgba(0, 229, 255, 0.05); }
      50% { stroke: rgba(0, 229, 255, 0.15); }
    }
    
    @keyframes signal-run {
      0% { fill: #060919; stroke: rgba(0, 229, 255, 0.06); }
      5% { fill: rgba(103, 232, 249, 0.2); stroke: #67E8F9; }
      15%, 100% { fill: #060919; stroke: rgba(0, 229, 255, 0.06); }
    }

    @keyframes reveal-name {
      0%, 40% { stroke: rgba(0, 229, 255, 0.06); fill: #060919; }
      55%, 100% { stroke: #00E5FF; fill: rgba(0, 229, 255, 0.08); }
    }

    @keyframes active-shimmer {
      0%, 70%, 100% { filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.45)); }
      85% { filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.85)); }
    }

    .cube {
      animation: breathe 4s infinite ease-in-out;
    }

    /* Assigning multi-stage timeline animation */
    .active {
      animation: reveal-name 8s infinite ease-in-out,
                 active-shimmer 8s infinite ease-in-out;
    }

    /* Staggered delays for the name letter discovery effect */
    .col-2, .col-3, .col-4, .col-5, .col-6, .col-7 { animation-delay: 0s, 0s; }
    .col-9, .col-10, .col-11, .col-12, .col-13, .col-14 { animation-delay: 0.3s, 0.3s; }
    .col-16, .col-17, .col-18, .col-19, .col-20, .col-21 { animation-delay: 0.6s, 0.6s; }
    .col-23, .col-24, .col-25, .col-26, .col-27, .col-28 { animation-delay: 0.9s, 0.9s; }
    .col-30, .col-31, .col-32, .col-33, .col-34, .col-35 { animation-delay: 1.2s, 1.2s; }
  </style>
  <rect class="bg" width="900" height="220" rx="12" />
  
  <g transform="translate(18, 18)">
`;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const key = `${r},${c}`;
    const x = c * 23;
    const y = r * 23;
    const isActive = ARYAN_MAP.has(key);
    const classes = isActive ? `cube active col-${c}` : 'cube';
    
    svgContent += `    <rect class="${classes}" x="${x}" y="${y}" width="18" height="18" />\n`;
  }
}

svgContent += `  </g>
</svg>
`;

fs.writeFileSync('c:\\Users\\aryan\\IlIGODIlI\\title.svg', svgContent);
console.log('Successfully regenerated title.svg');
