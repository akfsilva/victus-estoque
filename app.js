const KEY = "victus_storage_v1";
let items = JSON.parse(localStorage.getItem(KEY)) || [];
let folderState = {};

function save() { localStorage.setItem(KEY, JSON.stringify(items)); }

function getGoal(daily, ppl) {
    const m = +document.getElementById('calc_meses').value || 1;
    return Math.round(daily * (ppl || 1) * (m * 30.41));
}

window.add = function() {
    const n = document.getElementById('n').value.trim();
    if (!n) return;
    const c = +document.getElementById('cons').value || 0;
    const p = +document.getElementById('p_item').value || 1;

    items.push({
        id: Date.now(),
        name: n.toUpperCase(),
        cat: (document.getElementById('c').value || "GERAL").toUpperCase(),
        unit: (document.getElementById('u').value || "UN").toUpperCase(),
        qty: +document.getElementById('q').value || 0,
        cons: c,
        persons: p,
        note: document.getElementById('obs').value || "",
        goal: getGoal(c, p) || 1
    });
    save(); render();
};

window.upd = function(id, key, val) {
    const item = items.find(i => i.id === id);
    if (item) {
        item[key] = (['cat', 'unit', 'name'].includes(key)) ? val.toUpperCase() : parseFloat(val) || 0;
        save(); render();
    }
};

window.del = function(id) {
    if (confirm("REMOVERE?")) { items = items.filter(i => i.id !== id); save(); render(); }
};

window.toggleCat = function(c) { folderState[c] = !folderState[c]; render(); };

window.render = function() {
    const out = document.getElementById("estoque");
    out.innerHTML = "";
    const cats = [...new Set(items.map(i => i.cat))].sort();

    cats.forEach(cat => {
        const catItems = items.filter(i => i.cat === cat);
        const active = folderState[cat];
        const html = catItems.map(i => {
            const p = Math.min(100, (i.qty / i.goal) * 100);
            return `
                <div class="item-card">
                    <div class="item-title"><span>${i.name}</span> <span>${i.qty}${i.unit}</span></div>
                    <div class="val-grid">
                        <div><label>SALDO</label><input type="number" value="${i.qty}" onchange="upd(${i.id},'qty',this.value)"></div>
                        <div><label>META</label><input type="number" value="${i.goal}" onchange="upd(${i.id},'goal',this.value)"></div>
                        <div><label>PESS.</label><input type="number" value="${i.persons}" onchange="upd(${i.id},'persons',this.value)"></div>
                        <div><label>UNID</label><input type="text" value="${i.unit}" onchange="upd(${i.id},'unit',this.value)"></div>
                    </div>
                    <div class="bar-wrap ${p < 30 ? 'warning' : ''}"><div class="bar-core" style="width:${p}%"></div></div>
                    <button style="font-size:8px; border:none; background:none; text-decoration:underline; cursor:pointer;" onclick="del(${i.id})">DELETAR</button>
                </div>`;
        }).join("");

        const div = document.createElement("div");
        div.className = "cat-box";
        div.innerHTML = `<div class="cat-head" onclick="toggleCat('${cat}')">${cat} <span>${active ? '-' : '+'}</span></div><div class="${active ? '' : 'hidden'}">${html}</div>`;
        out.appendChild(div);
    });
};

window.exportData = function() {
    const blob = new Blob([JSON.stringify(items)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `victus_data.json`; a.click();
};

render();
