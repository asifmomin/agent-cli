// ANSI color codes for console formatting - using brighter/sharper colors
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    blue: '\x1b[94m',      // Bright blue
    green: '\x1b[92m',     // Bright green
    yellow: '\x1b[93m',    // Bright yellow
    magenta: '\x1b[95m',   // Bright magenta
    cyan: '\x1b[96m',      // Bright cyan
    gray: '\x1b[37m',      // White instead of gray for better visibility
    red: '\x1b[91m',       // Bright red
    orange: '\x1b[38;5;208m', // Orange for variety
    purple: '\x1b[38;5;129m'  // Purple for variety
};

export interface ConsoleSection {
    title: string;
    content: string;
    color: keyof typeof colors;
    icon: string;
}

export class ConsoleFormatter {
    /**
     * Display a formatted interaction with multiple sections
     */
    static displayInteraction(title: string, sections: ConsoleSection[]) {
        console.log('\n' + colors.cyan + colors.bold + '═'.repeat(80) + colors.reset);
        console.log(colors.cyan + colors.bold + title + colors.reset);
        console.log(colors.cyan + colors.bold + '═'.repeat(80) + colors.reset);

        sections.forEach(section => {
            if (section.content) {
                console.log('\n' + colors[section.color] + colors.bold + section.icon + ' ' + section.title + colors.reset);
                console.log(colors.gray + '┌─ ' + section.title.replace(/[^\w\s]/g, '') + colors.reset);
                
                const contentLines = section.content.split('\n');
                contentLines.forEach(line => {
                    console.log(colors[section.color] + '│  ' + line + colors.reset);
                });
                
                console.log(colors.gray + '└─' + colors.reset);
            }
        });

        console.log('');
    }

    /**
     * Display a simple status message
     */
    static displayStatus(message: string, color: keyof typeof colors = 'magenta', icon: string = '🔄') {
        console.log('\n' + colors[color] + icon + ' ' + message + colors.reset);
    }

    /**
     * Display an error message
     */
    static displayError(message: string) {
        console.log('\n' + colors.red + colors.bold + '❌ ERROR: ' + message + colors.reset);
    }

    /**
     * Display a success message
     */
    static displaySuccess(message: string) {
        console.log('\n' + colors.green + colors.bold + '✅ SUCCESS: ' + message + colors.reset);
    }
}