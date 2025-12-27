const KEY = "victus_pro_v1";

// Carrega os dados ou inicia com lista vazia
let items = JSON.parse(localStorage.getItem(KEY)) || [];
let folderState = {};
let infoState = false;

// Persistência de Dados
function save() {
    items.forEach(i => {
        i.cat = (i.cat || "GERAL").toUpperCase().trim();
        i.name = (i.name || "N/A").toUpperCase().trim();
    });
    localStorage.setItem(KEY, JSON.stringify(items));
}

// Cálculo de Meta Baseado em Consumo e Pessoas
function getGoal(daily, ppl) {
    const months = +document.getElementById('calc_meses').value || 1;
    return Math.round(daily * (ppl || 1) * (months * 30.41));
}

// Interface: Toggle Categorias
window.toggleCat = function(c) {
    folderState[c] = !folderState[c];
    render();
};

// Interface: Toggle Tabela Referência
window.toggleTable = function() {
    infoState = !infoState;
    document.getElementById('refTableContent').classList.toggle('hidden', !infoState);
};

// Adicionar Item
window.add = function() {
    const n = document.getElementById('n').value.trim();
    if (!n) return;

    const consVal = +document.getElementById('cons').value || 0;
    const pVal = +document.getElementById('p_item').value || 1;

    items.push({
        id: Date.now() + Math.random(),
        name: n.toUpperCase(),
        cat: (document.getElementById('c').value.trim() || "GERAL").toUpperCase(),
        unit: (document.getElementById('u').value.trim() || "UN").toUpperCase(),
        qty: +document.getElementById('q').value || 0,
        cons: consVal,
        persons: pVal,
        note: document.getElementById('obs').value || "",
        goal: getGoal(consVal, pVal) || 1
    });

    save(); render();
    ["n", "c", "u", "q", "cons", "p_item", "obs"].forEach(id => {
        document.getElementById(id).value = id === "p_item" ? "1" : "";
    });
};

// Atualizar Item Individualmente
window.upd = function(id, key, val) {
    const item = items.find(i => i.id === id);
    if (item) {
        item[key] = (['cat', 'unit', 'name'].includes(key)) 
            ? String(val).toUpperCase() 
            : (key === 'note' ? val : parseFloat(val) || 0);
        save(); render();
    }
};

// Fixar Sugestão como Meta
window.applyNewGoal = function(id, val) {
    const item = items.find(i => i.id === id);
    if (item) { item.goal = val; save(); render(); }
};

// Deletar Item
window.del = function(id) {
    if (confirm("REMOVERE? (APAGAR REGISTRO?)")) {
        items = items.filter(i => i.id !== id);
        save(); render();
    }
};

// Renderização da Interface
window.render = function() {
    const divEstoque = document.getElementById("estoque");
    divEstoque.innerHTML = "";
    
    if (items.length === 0) {
        divEstoque.innerHTML = `<p style="text-align:center; font-size:10px; color:var(--accent); padding:40px;">INVENTÁRIO VAZIO. AGUARDANDO DADOS.</p>`;
        return;
    }

    const categories = [...new Set(items.map(i => i.cat))].sort();

    categories.forEach(cat => {
        const catItems = items.filter(i => i.cat === cat);
        const active = folderState[cat];
        
        const html = catItems.map(i => {
            const target = getGoal(i.cons || 0, i.persons || 1);
            const p = i.goal ? Math.min(100, (i.qty / i.goal) * 100) : 0;
            return `
                <div class="item-card">
                    <div class="item-title"><span>> ${i.name}</span> <span>${i.qty} ${i.unit}</span></div>
                    <div class="suggest-box">
                        <span>SUGESTÃO: ${target} ${i.unit}</span>
                        <button style="font-size:8px; padding:2px 5px; cursor:pointer;" onclick="applyNewGoal(${i.id}, ${target})">FIXAR</button>
                    </div>
                    <div class="val-grid">
                        <div><label>SALDO</label><input type="number" step="0.1" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
                        <div><label>META</label><input type="number" value="${i.goal}" onchange="upd(${i.id},'goal',this.value)"></div>
                        <div><label>PESS.</label><input type="number" value="${i.persons}" onchange="upd(${i.id},'persons',this.value)"></div>
                        <div><label>UNID</label><input type="text" value="${i.unit}" onchange="upd(${i.id},'unit',this.value)"></div>
                    </div>
                    <div class="bar-wrap ${p < 30 ? 'warning' : ''}"><div class="bar-core" style="width:${p}%"></div></div>
                    <input type="text" style="width:100%; font-size:9px; border:none; background:transparent; border-bottom:1px solid rgba(0,0,0,0.05);" value="${i.note}" placeholder="MEMORANDUM" onchange="upd(${i.id},'note',this.value)">
                    <button class="btn-del" onclick="del(${i.id})">DELETAR</button>
                </div>`;
        }).join("");

        const section = document.createElement("div");
        section.className = "cat-box";
        section.innerHTML = `
            <div class="cat-head" onclick="toggleCat('${cat}')">${cat} <span>${active ? '[-]' : '[+]'}</span></div>
            <div class="${active ? '' : 'hidden'}">${html}</div>`;
        divEstoque.appendChild(section);
    });
};

// Exportar Backup
window.exportData = function() {
    const blob = new Blob([JSON.stringify(items, null, 2)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `victus_data.json`; a.click();
};

// Importar Backup
window.importData = function(e) {
    const reader = new FileReader();
    reader.onload = (ev) => { 
        try {
            items = JSON.parse(ev.target.result); 
            save(); render(); 
        } catch(err) {
            alert("ERRO NA LEITURA DO ARQUIVO.");
        }
    };
    reader.readAsText(e.target.files[0]);
};

// Registro do Service Worker (Essencial para APK/Offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('VICTUS SW ONLINE', reg))
            .catch(err => console.log('SW ERROR', err));
    });
}

// Inicializar App
render();
