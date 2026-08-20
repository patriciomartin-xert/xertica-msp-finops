// --- CRM & Prospectos Logic for Xertica MSP FinOps ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Seed Leads Data (if localStorage is empty)
    initSeedLeads();

    // 2. DOM Element References
    const crmSearchInput = document.getElementById('crmSearchInput');
    const crmCountryFilter = document.getElementById('crmCountryFilter');
    const crmStageFilter = document.getElementById('crmStageFilter');
    const toggleTableViewBtn = document.getElementById('toggleTableViewBtn');
    const toggleKanbanViewBtn = document.getElementById('toggleKanbanViewBtn');
    const crmTableView = document.getElementById('crmTableView');
    const crmKanbanView = document.getElementById('crmKanbanView');
    const exportLeadsCsvBtn = document.getElementById('exportLeadsCsvBtn');
    
    const openNewLeadBtn = document.getElementById('openNewLeadBtn');
    const newLeadModal = document.getElementById('newLeadModal');
    const closeNewLeadModalBtn = document.getElementById('closeNewLeadModalBtn');
    const newLeadForm = document.getElementById('newLeadForm');

    const leadDetailModal = document.getElementById('leadDetailModal');
    const closeLeadDetailBtn = document.getElementById('closeLeadDetailBtn');
    const leadDetailStageSelect = document.getElementById('leadDetailStageSelect');
    const addNoteForm = document.getElementById('addNoteForm');
    const deleteLeadBtn = document.getElementById('deleteLeadBtn');

    let currentSelectedLeadId = null;

    // 3. Render Dashboard View
    renderCRM();

    // --- 4. Event Listeners ---
    if (crmSearchInput) crmSearchInput.addEventListener('input', renderCRM);
    if (crmCountryFilter) crmCountryFilter.addEventListener('change', renderCRM);
    if (crmStageFilter) crmStageFilter.addEventListener('change', renderCRM);

    // View Switching (Table vs Kanban)
    if (toggleTableViewBtn && toggleKanbanViewBtn) {
        toggleTableViewBtn.addEventListener('click', () => {
            toggleTableViewBtn.classList.add('active');
            toggleKanbanViewBtn.classList.remove('active');
            crmTableView.style.display = 'block';
            crmKanbanView.style.display = 'none';
        });

        toggleKanbanViewBtn.addEventListener('click', () => {
            toggleKanbanViewBtn.classList.add('active');
            toggleTableViewBtn.classList.remove('active');
            crmTableView.style.display = 'none';
            crmKanbanView.style.display = 'block';
        });
    }

    // New Lead Modal Logic
    if (openNewLeadBtn) openNewLeadBtn.addEventListener('click', () => newLeadModal.classList.add('active'));
    if (closeNewLeadModalBtn) closeNewLeadModalBtn.addEventListener('click', () => newLeadModal.classList.remove('active'));

    if (newLeadForm) {
        newLeadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('newLeadName').value.trim();
            const empresa = document.getElementById('newLeadEmpresa').value.trim();
            const cargo = document.getElementById('newLeadCargo').value.trim();
            const email = document.getElementById('newLeadEmail').value.trim();
            const phone = document.getElementById('newLeadPhone').value.trim();
            const pais = document.getElementById('newLeadPais').value;
            const value = parseFloat(document.getElementById('newLeadValue').value) || 15000;

            const newLead = {
                id: 'lead-' + Date.now(),
                name,
                empresa,
                cargo,
                pais,
                telefono: phone,
                email,
                source: 'Registro Manual CRM',
                status: 'Nuevo',
                stage: 'Nuevos Leads',
                estimatedValue: value,
                dateStr: new Date().toLocaleString('es-MX'),
                location: `${pais} 🌐`,
                ipProvider: 'Registro Interno',
                device: 'Desktop • CRM Web',
                notes: ['Lead registrado manualmente desde el portal CRM.']
            };

            let leads = getLeads();
            leads.unshift(newLead);
            saveLeads(leads);

            newLeadForm.reset();
            newLeadModal.classList.remove('active');
            renderCRM();
        });
    }

    // Lead Detail Modal Close
    if (closeLeadDetailBtn) {
        closeLeadDetailBtn.addEventListener('click', () => {
            leadDetailModal.classList.remove('active');
            currentSelectedLeadId = null;
        });
    }

    // Change Pipeline Stage
    if (leadDetailStageSelect) {
        leadDetailStageSelect.addEventListener('change', (e) => {
            if (!currentSelectedLeadId) return;
            const newStage = e.target.value;
            let leads = getLeads();
            const idx = leads.findIndex(l => l.id === currentSelectedLeadId);
            if (idx >= 0) {
                leads[idx].stage = newStage;
                leads[idx].notes.unshift(`Etapa actualizada a "${newStage}" el ${new Date().toLocaleDateString('es-MX')}`);
                saveLeads(leads);
                renderCRM();
                openLeadDetail(leads[idx]);
            }
        });
    }

    // Add Internal Note
    if (addNoteForm) {
        addNoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('newNoteInput');
            const text = input.value.trim();
            if (!text || !currentSelectedLeadId) return;

            let leads = getLeads();
            const idx = leads.findIndex(l => l.id === currentSelectedLeadId);
            if (idx >= 0) {
                const timestamp = new Date().toLocaleString('es-MX');
                leads[idx].notes.unshift(`${text} (${timestamp})`);
                saveLeads(leads);
                input.value = '';
                openLeadDetail(leads[idx]);
            }
        });
    }

    // Delete Lead
    if (deleteLeadBtn) {
        deleteLeadBtn.addEventListener('click', () => {
            if (!currentSelectedLeadId) return;
            if (confirm('¿Estás seguro de que deseas eliminar este prospecto?')) {
                let leads = getLeads().filter(l => l.id !== currentSelectedLeadId);
                saveLeads(leads);
                leadDetailModal.classList.remove('active');
                currentSelectedLeadId = null;
                renderCRM();
            }
        });
    }

    // Export CSV
    if (exportLeadsCsvBtn) {
        exportLeadsCsvBtn.addEventListener('click', exportToCSV);
    }
});

// --- HELPER FUNCTIONS ---

function getLeads() {
    return JSON.parse(localStorage.getItem('xertica_msp_leads') || '[]');
}

function saveLeads(leads) {
    localStorage.setItem('xertica_msp_leads', JSON.stringify(leads));
}

function initSeedLeads() {
    let existing = localStorage.getItem('xertica_msp_leads');
    if (!existing || JSON.parse(existing).length === 0) {
        const seedData = [
            {
                id: 'lead-seed-1',
                name: 'Carlos Mendoza',
                empresa: 'Grupo Bimbo',
                cargo: 'VP de Infraestructura Cloud',
                pais: 'México 🇲🇽',
                telefono: '+52 55 5268 6600',
                email: 'carlos.mendoza@bimbo.com',
                source: 'Formulario Assessment Landing',
                status: 'Nuevo',
                stage: 'Nuevos Leads',
                estimatedValue: 45000,
                dateStr: new Date(Date.now() - 3600000 * 2).toLocaleString('es-MX'),
                location: 'CDMX, México 🇲🇽',
                ipProvider: 'Bimbo Corporate Network (ASN 28122)',
                device: 'Desktop • Chrome (macOS)',
                notes: ['Interesado en optimizar costos de Google Cloud y AWS.', 'Solicita evaluación de arquitectura multicloud.']
            },
            {
                id: 'lead-seed-2',
                name: 'Ana Sofia Restrepo',
                empresa: 'Credicorp Capital',
                cargo: 'Head of IT & Cloud Operations',
                pais: 'Colombia 🇨🇴',
                telefono: '+57 300 458 9200',
                email: 'asofia.restrepo@credicorp.com',
                source: 'Calculadora de ROI',
                status: 'En Contacto',
                stage: 'En Contacto',
                estimatedValue: 32000,
                dateStr: new Date(Date.now() - 3600000 * 18).toLocaleString('es-MX'),
                location: 'Bogotá, Colombia 🇨🇴',
                ipProvider: 'Credicorp Finance Network',
                device: 'Desktop • Edge (Windows)',
                notes: ['Llamada exploratoria agendada para revisar governance FinOps.', 'Requiere cumplimiento normativo bancario.']
            },
            {
                id: 'lead-seed-3',
                name: 'Roberto Gómez',
                empresa: 'Coppel Tech',
                cargo: 'Director de Ingeniería FinOps',
                pais: 'México 🇲🇽',
                telefono: '+52 81 8300 1200',
                email: 'rgomez@coppel.com',
                source: 'Formulario Assessment Landing',
                status: 'Assessment Agendado',
                stage: 'Assessment Agendado',
                estimatedValue: 60000,
                dateStr: new Date(Date.now() - 3600000 * 36).toLocaleString('es-MX'),
                location: 'Monterrey, México 🇲🇽',
                ipProvider: 'Axtel Corp / Coppel HQ',
                device: 'Desktop • Chrome (Windows)',
                notes: ['Assessment FinOps de 14 días agendado para el lunes.', 'Maneja una factura mensual de +$120K USD en Azure.']
            },
            {
                id: 'lead-seed-4',
                name: 'Mariana Silva',
                empresa: 'Salud Digna',
                cargo: 'Gerente de Sistemas y Telemedicina',
                pais: 'México 🇲🇽',
                telefono: '+52 667 758 0100',
                email: 'msilva@salud-digna.org',
                source: 'Enlace Personalizado URL',
                status: 'Propuesta Enviada',
                stage: 'Propuesta Enviada',
                estimatedValue: 28000,
                dateStr: new Date(Date.now() - 3600000 * 72).toLocaleString('es-MX'),
                location: 'Culiacán, México 🇲🇽',
                ipProvider: 'Telmex / Salud Digna Systems',
                device: 'Mobile • Safari (iOS)',
                notes: ['Propuesta enviada con plan de ahorro proyectado de 28% anual.', 'Pendiente revisión con Comité Directivo.']
            },
            {
                id: 'lead-seed-5',
                name: 'Felipe Valenzuela',
                empresa: 'Falabella Retail',
                cargo: 'CTO E-Commerce',
                pais: 'Chile 🇨🇱',
                telefono: '+56 9 8765 4321',
                email: 'fvalenzuela@falabella.cl',
                source: 'Recomendación Directa',
                status: 'Ganado',
                stage: 'Ganado / Cierre',
                estimatedValue: 55000,
                dateStr: new Date(Date.now() - 3600000 * 120).toLocaleString('es-MX'),
                location: 'Santiago, Chile 🇨🇱',
                ipProvider: 'Falabella IT Systems',
                device: 'Desktop • Chrome (macOS)',
                notes: ['Contrato MSP FinOps firmado exitosamente.', 'Inicio de onboarding de la fábrica de optimización.']
            }
        ];
        saveLeads(seedData);
    }
}

// Render Table, Kanban and KPIs
function renderCRM() {
    const leads = getLeads();
    const query = (document.getElementById('crmSearchInput')?.value || '').toLowerCase().trim();
    const countryFilter = document.getElementById('crmCountryFilter')?.value || 'ALL';
    const stageFilter = document.getElementById('crmStageFilter')?.value || 'ALL';

    // Filter Leads
    const filteredLeads = leads.filter(l => {
        const matchesQuery = !query || 
            (l.name && l.name.toLowerCase().includes(query)) ||
            (l.empresa && l.empresa.toLowerCase().includes(query)) ||
            (l.cargo && l.cargo.toLowerCase().includes(query)) ||
            (l.email && l.email.toLowerCase().includes(query)) ||
            (l.pais && l.pais.toLowerCase().includes(query));

        const matchesCountry = countryFilter === 'ALL' || (l.pais && l.pais.includes(countryFilter));
        const matchesStage = stageFilter === 'ALL' || l.stage === stageFilter;

        return matchesQuery && matchesCountry && matchesStage;
    });

    // 1. Calculate KPIs
    const totalCount = leads.length;
    const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const assessmentsCount = leads.filter(l => l.stage === 'Assessment Agendado' || l.stage === 'Nuevos Leads').length;
    const qualifiedCount = leads.filter(l => l.stage === 'Propuesta Enviada' || l.stage === 'Ganado / Cierre').length;

    document.getElementById('kpiTotalLeads').textContent = totalCount;
    document.getElementById('kpiPipelineValue').textContent = `$${totalPipelineValue.toLocaleString()} USD`;
    document.getElementById('kpiAssessmentsCount').textContent = assessmentsCount;
    document.getElementById('kpiQualifiedCount').textContent = qualifiedCount;

    // 2. Render Table View
    renderTable(filteredLeads);

    // 3. Render Kanban View
    renderKanban(filteredLeads);
}

function renderTable(leads) {
    const tbody = document.getElementById('crmTableBody');
    if (!tbody) return;

    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px; color:#888;">No se encontraron prospectos que coincidan con la búsqueda.</td></tr>';
        return;
    }

    tbody.innerHTML = leads.map(l => {
        const stageBadgeStyle = getStageStyle(l.stage);
        const cleanPhone = (l.telefono || '').replace(/[^0-9]/g, '');

        return `
            <tr data-id="${l.id}">
                <td>
                    <div style="font-weight: 700; color: #FFF; font-size: 0.98rem;">${l.name}</div>
                    <div style="font-size: 0.82rem; color: #aaa;">${l.email}</div>
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--xe-yellow);">${l.empresa}</div>
                    <div style="font-size: 0.82rem; color: #888;">${l.cargo}</div>
                </td>
                <td><span style="font-weight: 500;">${l.pais}</span></td>
                <td style="font-size: 0.85rem; color: #aaa;">${l.dateStr}</td>
                <td style="font-weight: 700; color: #4ade80;">$${(l.estimatedValue || 0).toLocaleString()} USD</td>
                <td>
                    <span class="live-badge" style="${stageBadgeStyle}">${l.stage}</span>
                </td>
                <td style="text-align:center;">
                    <button class="btn-action-icon view-lead-btn" data-id="${l.id}" title="Ver Ficha Completa">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    ${cleanPhone ? `
                    <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-action-icon text-green" title="WhatsApp Directo">
                        <span class="material-symbols-outlined">chat</span>
                    </a>` : ''}
                </td>
            </tr>
        `;
    }).join('');

    // Row / Button Click Listeners
    tbody.querySelectorAll('.view-lead-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const lead = getLeads().find(l => l.id === id);
            if (lead) openLeadDetail(lead);
        });
    });
}

function renderKanban(leads) {
    const stages = [
        { name: 'Nuevos Leads', containerId: 'kanbanContainerNew', countId: 'countStageNew' },
        { name: 'En Contacto', containerId: 'kanbanContainerContact', countId: 'countStageContact' },
        { name: 'Assessment Agendado', containerId: 'kanbanContainerAssessment', countId: 'countStageAssessment' },
        { name: 'Propuesta Enviada', containerId: 'kanbanContainerProposal', countId: 'countStageProposal' },
        { name: 'Ganado / Cierre', containerId: 'kanbanContainerWon', countId: 'countStageWon' }
    ];

    stages.forEach(st => {
        const container = document.getElementById(st.containerId);
        const countElem = document.getElementById(st.countId);
        if (!container) return;

        const stageLeads = leads.filter(l => l.stage === st.name);
        if (countElem) countElem.textContent = stageLeads.length;

        if (stageLeads.length === 0) {
            container.innerHTML = '<div class="kanban-empty">Sin prospectos</div>';
            return;
        }

        container.innerHTML = stageLeads.map(l => {
            return `
                <div class="kanban-card" data-id="${l.id}">
                    <div class="kanban-card-top">
                        <span class="kanban-card-company">${l.empresa}</span>
                        <span class="kanban-card-value">$${(l.estimatedValue || 0).toLocaleString()} USD</span>
                    </div>
                    <h4 class="kanban-card-name">${l.name}</h4>
                    <p class="kanban-card-cargo">${l.cargo} • ${l.pais}</p>
                    <div class="kanban-card-footer">
                        <span class="kanban-card-date">${l.dateStr.split(',')[0]}</span>
                        <button class="btn-kanban-view view-lead-btn" data-id="${l.id}">
                            Ver Ficha <span class="material-symbols-outlined icon-small">arrow_forward</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.view-lead-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const lead = getLeads().find(l => l.id === id);
                if (lead) openLeadDetail(lead);
            });
        });
    });
}

function openLeadDetail(lead) {
    currentSelectedLeadId = lead.id;
    const modal = document.getElementById('leadDetailModal');
    if (!modal) return;

    document.getElementById('leadDetailName').textContent = lead.name;
    document.getElementById('leadDetailSub').textContent = `${lead.cargo} @ ${lead.empresa}`;
    document.getElementById('leadDetailEmpresa').textContent = lead.empresa;
    document.getElementById('leadDetailCargo').textContent = lead.cargo;
    document.getElementById('leadDetailPais').textContent = lead.pais;
    document.getElementById('leadDetailPhone').textContent = lead.telefono || 'No especificado';
    document.getElementById('leadDetailEmail').textContent = lead.email;
    document.getElementById('leadDetailValue').textContent = `$${(lead.estimatedValue || 0).toLocaleString()} USD`;
    document.getElementById('leadDetailDate').textContent = lead.dateStr;
    document.getElementById('leadDetailTelemetry').textContent = `${lead.location} • ${lead.ipProvider || 'Red Local'}`;

    // WhatsApp and Email links
    const cleanPhone = (lead.telefono || '').replace(/[^0-9]/g, '');
    const waBtn = document.getElementById('leadWhatsAppBtn');
    if (waBtn) {
        if (cleanPhone) {
            waBtn.href = `https://wa.me/${cleanPhone}`;
            waBtn.style.display = 'inline-flex';
        } else {
            waBtn.style.display = 'none';
        }
    }

    const mailBtn = document.getElementById('leadEmailBtn');
    if (mailBtn) {
        mailBtn.href = `mailto:${lead.email}?subject=Xertica%20MSP%20FinOps%20-%20Seguimiento`;
    }

    // Set stage select
    const stageSelect = document.getElementById('leadDetailStageSelect');
    if (stageSelect) stageSelect.value = lead.stage;

    // Render Notes
    const notesList = document.getElementById('leadNotesList');
    if (notesList) {
        if (lead.notes && lead.notes.length > 0) {
            notesList.innerHTML = lead.notes.map(n => `<li>${n}</li>`).join('');
        } else {
            notesList.innerHTML = '<li style="color:#888;">Sin notas registradas.</li>';
        }
    }

    modal.classList.add('active');
}

function getStageStyle(stage) {
    switch (stage) {
        case 'Nuevos Leads':
            return 'background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4);';
        case 'En Contacto':
            return 'background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4);';
        case 'Assessment Agendado':
            return 'background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);';
        case 'Propuesta Enviada':
            return 'background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4);';
        case 'Ganado / Cierre':
            return 'background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4);';
        default:
            return 'background: rgba(255, 255, 255, 0.1); color: #FFF;';
    }
}

function exportToCSV() {
    const leads = getLeads();
    if (leads.length === 0) {
        alert('No hay prospectos para exportar.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nombre,Empresa,Cargo,Email,Telefono,Pais,Etapa,Valor USD,Fecha,Ubicacion IP\n";

    leads.forEach(l => {
        const row = [
            `"${l.id}"`,
            `"${l.name}"`,
            `"${l.empresa}"`,
            `"${l.cargo}"`,
            `"${l.email}"`,
            `"${l.telefono || ''}"`,
            `"${l.pais}"`,
            `"${l.stage}"`,
            `"${l.estimatedValue || 0}"`,
            `"${l.dateStr}"`,
            `"${l.location}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `xertica_prospectos_finops_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
