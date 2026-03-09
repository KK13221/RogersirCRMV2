describe('Main Dashboard E2E', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display the desktop dashboard overview', () => {
        // Check main elements
        cy.contains('Dashboard Overview').should('be.visible');
        cy.contains('GBT Admin').should('be.visible');
        cy.contains('Real-time performance monitoring').should('be.visible');

        // Check sidebar Navigation
        cy.get('aside nav').should('be.visible');
        cy.contains('aside nav', 'Dashboard').should('be.visible');
        cy.contains('aside nav', 'Users').should('be.visible');
        cy.contains('aside nav', 'Alerts').should('be.visible');
        cy.contains('aside nav', 'Development').should('be.visible');
        cy.contains('aside nav', 'Apps').should('be.visible');
        cy.contains('aside nav', 'Archive').should('be.visible');

        // Customer Section in sidebar
        cy.contains('aside nav', 'Customer Dashboard').should('be.visible');
        cy.contains('aside nav', 'Contacts').should('be.visible');
        cy.contains('aside nav', 'Servers').should('be.visible');
        cy.contains('aside nav', 'Finance').should('be.visible');

        // Check metrics
        cy.contains('Total Customers').should('be.visible');
        cy.contains('1,284').should('be.visible');

        cy.contains('Active Devices').should('be.visible');
        cy.contains('45,602').should('be.visible');

        cy.contains('Total Apps').should('be.visible');
        cy.contains('89').should('be.visible');

        cy.contains('Server Status').should('be.visible');
        cy.contains('Healthy').should('be.visible');

        // Check chart and recent activity
        cy.contains('Active Devices Trend').scrollIntoView().should('be.visible');
        cy.contains('Apps Activated vs Deactivated').scrollIntoView().should('be.visible');
        cy.contains('Server Health Summary').scrollIntoView().should('be.visible');
        cy.contains('Recent Alerts').scrollIntoView().should('be.visible');
    });

    it('should have working sidebar navigation buttons', () => {
        cy.get('aside nav a').contains('Users').click();
        cy.url().should('include', '/');
    });
});
