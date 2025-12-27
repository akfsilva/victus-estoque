const DB_KEY = "victus_mainframe_v1";
let items = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let folders = {};
let refVisible = false;

const save = () => localStorage.setItem(DB_KEY, JSON.stringify(items));

const getTarget = (daily, ppl) => {
    const m = +document.getElementById('calc_meses').value || 1;
    return Math.round(daily * (ppl || 1) * (m * 30.41));
};

window.add = () => {
    const n = document.getElementById('n').value.trim();
    if (!n) return;
    const cons = +document.getElementById('cons').value || 0;
    const ppl = +document.getElementById('p_item').value || 1;

    items.push({
        id: Date.now(),
        name: n.toUpperCase(),
        cat: (document.getElementById('c').value || "GERAL").toUpperCase(),
        unit: (document.getElementById('u').value || "UN").toUpperCase(),
        qty: +document.getElementById('q').value || 0,
        cons: cons,
        persons: ppl,
        note: document.getElementById('obs').value.toUpperCase() || "",
        goal: getTarget(cons, ppl) || 1
    });
    save(); render();
    ["n", "c", "u", "q", "cons", "p_item", "obs"].forEach(id => document.getElementById(id).value = id === "p_item" ? "1" : "");
};

window.upd = (id, k, v) => {
    const i = items.find(x => x.id === id);
    if (i) {
        i[k] = (['cat', 'unit', 'name'].includes(k)) ? v.toUpperCase() : (k === 'note' ? v.toUpperCase() : parseFloat(v) || 0);
        save(); render();
    }
};

window.setGoal = (id, v) => {
    const i = items.find(x => x.id === id);
    if (i) { i.goal = v; save(); render(); }
};

window.del = (id) => {
    if (confirm("DELETAR REGISTRO?")) { items = items.filter(x => x.id !== id); save(); render(); }
};

window.toggleCat = (c) => { folders[c] = !folders[c]; render(); };
window.toggleTable = () => {
    refVisible = !refVisible;
    document.getElementById('refTableContent').classList.toggle('hidden', !refVisible);
};

window.render = () => {
    const container = document.getElementById("estoque");
    container.innerHTML = "";
    const cats = [...new Set(items.map(i => i.cat))].sort();

    cats.forEach(cat => {
        const catItems = items.filter(i => i.cat === cat);
        const isOpen = folders[cat];
        const html = catItems.map(i => {
            const sug = getTarget(i.cons, i.persons);
            const p = i.goal ? Math.min(100, (i.qty / i.goal) * 100) : 0;
            return `
                <div class="item-card">
                    <div class="item-title"><span>> ${i.name}</span> <span>${i.qty} ${i.unit}</span></div>
                    <div class="suggest-box">
                        <span>SUGESTAO_AUTONOMA: ${sug} ${i.unit}</span>
                        <button onclick="setGoal(${i.id}, ${sug})">APLICAR</button>
                    </div>
                    <div class="val-grid">
                        <div><label>SALDO</label><input type="number" step="0.1" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
                        <div><label>META</label><input type="number" value="${i.goal}" onchange="upd(${i.id},'goal',this.value)"></div>
                        <div><label>PESS.</label><input type="number" value="${i.persons}" onchange="upd(${i.id},'persons',this.value)"></div>
                        <div><label>UNID</label><input type="text" value="${i.unit}" onchange="upd(${i.id},'unit',this.value)"></div>
                    </div>
                    <div class="bar-wrap ${p < 30 ? 'warning' : ''}"><div class="bar-core" style="width:${p}%"></div></div>
                    <input type="text" style="width:100%; background:transparent; border:none; color:var(--dim); font-size:9px;" value="${i.note}" placeholder="SEM NOTAS" onchange="upd(${i.id},'note',this.value)">
                    <button class="btn-del" onclick="del(${i.id})">[ REMOVER_ITEM ]</button>
                </div>`;
        }).join("");

        const div = document.createElement("div");
        div.className = "cat-box";
        div.innerHTML = `<div class="cat-head" onclick="toggleCat('${cat}')">${cat} <span>${isOpen ? '[-]' : '[+]'}</span></div><div class="${isOpen ? '' : 'hidden'}">${html}</div>`;
        container.appendChild(div);
    });
};

window.exportData = () => {
    const b = new Blob([JSON.stringify(items, null, 2)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = "victus_mainframe_backup.json"; a.click();
};

window.importData = (e) => {
    const r = new FileReader();
    r.onload = (ev) => { items = JSON.parse(ev.target.result); save(); render(); };
    r.readAsText(e.target.files[0]);
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); });
}

render();
