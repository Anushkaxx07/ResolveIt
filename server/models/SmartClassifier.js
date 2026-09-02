class SmartClassifier {
  static predict({ title = '', description = '' }) {
    const text = `${title} ${description}`.toLowerCase();

    const rules = [
      {
        department: 'IT',
        categoryId: 2,
        categoryName: 'Network & VPN',
        keywords: ['vpn', 'wifi', 'network', 'connect', 'internet', 'dns', 'gateway'],
        priority: 'High',
      },
      {
        department: 'IT',
        categoryId: 1,
        categoryName: 'Hardware & Laptops',
        keywords: ['laptop', 'boot', 'battery', 'screen', 'keyboard', 'hardware', 'monitor', 'dock', 'charger'],
        priority: 'High',
      },
      {
        department: 'IT',
        categoryId: 3,
        categoryName: 'Software & Licenses',
        keywords: ['install', 'software', 'license', 'docker', 'ide', 'visual studio', 'matlab', 'tool'],
        priority: 'Medium',
      },
      {
        department: 'HR',
        categoryId: 4,
        categoryName: 'Leave Policy & Benefits',
        keywords: ['leave', 'vacation', 'holiday', 'pto', 'sick', 'insurance', 'medical', 'maternity'],
        priority: 'Low',
      },
      {
        department: 'HR',
        categoryId: 5,
        categoryName: 'Payroll & Taxes',
        keywords: ['salary', 'payroll', 'tax', 'deduction', 'w2', 'payslip', 'compensation'],
        priority: 'Medium',
      },
      {
        department: 'Facilities',
        categoryId: 6,
        categoryName: 'Workplace & Climate Control',
        keywords: ['ac', 'air conditioning', 'temperature', 'hvac', 'light', 'chair', 'desk', 'cold', 'hot'],
        priority: 'Medium',
      },
      {
        department: 'Facilities',
        categoryId: 7,
        categoryName: 'Building Access & ID Cards',
        keywords: ['badge', 'id card', 'parking', 'door', 'building', 'entry', 'access card'],
        priority: 'Medium',
      },
      {
        department: 'Finance',
        categoryId: 8,
        categoryName: 'Expense Reimbursement',
        keywords: ['expense', 'reimbursement', 'receipt', 'claim', 'travel', 'hotel', 'flight'],
        priority: 'Medium',
      },
      {
        department: 'Finance',
        categoryId: 9,
        categoryName: 'Vendor Invoicing',
        keywords: ['vendor', 'invoice', 'purchase order', 'po', 'payment', 'billing'],
        priority: 'Low',
      },
      {
        department: 'Access Management',
        categoryId: 10,
        categoryName: 'Application Access & SSO',
        keywords: ['sso', 'login', 'permission', 'iam', 'aws', 'azure', 'database access', 'admin rights'],
        priority: 'High',
      },
      {
        department: 'Access Management',
        categoryId: 11,
        categoryName: 'Role Permissions',
        keywords: ['role', 'group', 'security group', 'privilege', 'elevation'],
        priority: 'Medium',
      },
    ];

    let bestMatch = null;
    let highestScore = 0;

    for (const rule of rules) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          score += kw.length;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = rule;
      }
    }

    if (bestMatch && highestScore > 0) {
      return {
        department: bestMatch.department,
        categoryId: bestMatch.categoryId,
        categoryName: bestMatch.categoryName,
        suggestedPriority: bestMatch.priority,
        confidence: Math.min(Math.round((highestScore / 15) * 100), 95),
      };
    }

    return {
      department: 'IT',
      categoryId: 1,
      categoryName: 'Hardware & Laptops',
      suggestedPriority: 'Medium',
      confidence: 50,
    };
  }
}

module.exports = SmartClassifier;
