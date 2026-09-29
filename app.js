const STORAGE_KEY = "rifcFriends";

const DEFAULT_STATE = {
  goal: 30000,
  goalLocked: false,
  items: [
    { id: 1, name: "Primary Care for 15 Patients", price: 5000, quantity: 0 },
    { id: 2, name: "Dental Care for 5 Patients", price: 3000, quantity: 0 },
    { id: 3, name: "Women's Health", price: 2000, quantity: 0 },
    { id: 4, name: "Medication Assistance", price: 1000, quantity: 0 },
    { id: 5, name: "Education & Training", price: 500, quantity: 0 },
    { id: 6, name: "Medical Supplies", price: 250, quantity: 0 },
    { id: 7, name: "Clinic Pantry", price: 100, quantity: 0 }
  ]
};

const FUNDRAISING_MILESTONES = [
  10000,
  15000,
  25000,
  30000
];

let goalCelebrated = false;

function getDisplayGoal(total, originalGoal, goalLocked) {
  if(goalLocked) {
    return originalGoal;
  }

  if(total <= originalGoal) {
    return originalGoal;
  }

  const increment = 10000;

  return Math.ceil(total / increment) * increment;
}

function getMilestones(displayGoal, originalGoal) {
  const increase = displayGoal - originalGoal;

  return [
    10000 + increase,
    15000 + increase,
    25000 + increase,
    30000 + increase
  ];
}

function renderMilestones(state, total, displayGoal) {
  const container = document.getElementById("milestones");
  if(!container) return;
  
  const originalGoal = Number(state.goal) || 30000;

  if (container.dataset.goal !== String(displayGoal)) {
    container.querySelectorAll(".milestone").forEach(marker => {
      if (marker.reachTimer) {
        clearTimeout(marker.reachTimer);
      }
    });
    container.innerHTML = "";
    container.dataset.goal = String(displayGoal);

    const milestones = getMilestones(displayGoal, originalGoal);

    milestones.forEach(milestone => {
      const position = (milestone / displayGoal) * 100;

    const marker = document.createElement("div");
      marker.className = "milestone";
      marker.dataset.milestone = milestone;
      marker.style.bottom = `${position}%`;

      const line = document.createElement("div");
      line.className = "milestone-line";

      const label = document.createElement("div");
      label.className = "milestone-label";
      label.textContent = money(milestone);

      marker.appendChild(line);
      marker.appendChild(label);
      container.appendChild(marker); 
  });
  }
  const markers = container.querySelectorAll(".milestone");

  markers.forEach((marker) => {
    const milestone = Number(marker.dataset.milestone);
    const reached = total >= milestone;
    const alreadyReached = marker.classList.contains("reached");

  if(!reached) {
    if (marker.reachTimer) {
      clearTimeout(marker.reachTimer);
      marker.reachTimer = null;
    }

    if(alreadyReached) {
      marker.classList.remove("reached");
    }
    return;
  }

  if(alreadyReached) {
    return;
  }

  marker.reachTimer = setTimeout(() => {
    marker.reachTimer = null;

    const latestState = loadState();
    const { total: latestTotal } = totals(latestState);

    if(latestTotal >= milestone) {
      marker.classList.add("reached");
    }
  }, 900);
});
}

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();

    const saved = JSON.parse(raw);

    if (!Array.isArray(saved.items) || saved.items.length === 0) {
      return cloneDefault();
    }

    return saved;
  } catch {
    return cloneDefault();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("rifc-fundraiser");
    channel.postMessage(state);
    channel.close();
  }
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function totals(state) {
  const total = state.items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const bids = state.items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const percent = state.goal > 0 ? (total / state.goal) * 100 : 0;

  return { total, bids, percent };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

function renderAdmin(state) {
  const { total, bids, percent } = totals(state);

  document.getElementById("goalInput").value = state.goal;
  document.getElementById("adminTotal").textContent = money(total);
  document.getElementById("bottomTotal").textContent = money(total);
  document.getElementById("bidCount").textContent = bids;
  document.getElementById("adminPercent").textContent = `${Math.round(percent)}%`;
  document.getElementById("miniProgress").style.width =
    `${Math.min(percent, 100)}%`;

  const container = document.getElementById("items");
  container.innerHTML = "";

  state.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "item-row";

    row.innerHTML = `
      <div class="item-name">${escapeHtml(item.name)}</div>
      <div class="item-price">${money(item.price)} each</div>
      <div class="stepper">
        <button data-action="minus" data-id="${item.id}" aria-label="Decrease ${escapeHtml(item.name)}">−</button>
        <input
          class="quantity"
          value="${item.quantity}"
          data-action="quantity"
          data-id="${item.id}"
          type="number"
          min="0"
          aria-label="Quantity sold for ${escapeHtml(item.name)}"
        >
        <button data-action="plus" data-id="${item.id}" aria-label="Increase ${escapeHtml(item.name)}">+</button>
      </div>
      <div class="item-total">${money(item.price * item.quantity)}</div>
    `;

    container.appendChild(row);
  });
}

function celebrateGoal () {
  if (goalCelebrated) return;

  goalCelebrated = true;

  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6}
  });

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: {x:0.2, y:0.6}
    });

    confetti({
      particleCount: 100,
      spread: 120,
      origin: {x: 0.8, y:0.6}
    });
  }, 400);
}

let previousPublicTotal = null;
let totalAnimationFrame = null;

function animateTotal(element, from, to, duration = 900) {
  if (!element) return;

  if (totalAnimationFrame) {
    cancelAnimationFrame(totalAnimationFrame);
  }

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased = 1 - Math.pow(1 - progress, 3);

    const value = from + (to - from) * eased;

    element.textContent = money(Math.round(value));

    if (progress < 1) {
      totalAnimationFrame = requestAnimationFrame(update);
    } else {
      // Always finish on the actual total
      element.textContent = money(to);
      totalAnimationFrame = null;
    }
  }

  totalAnimationFrame = requestAnimationFrame(update);
}

function triggerDonationSurge() {
  const stage = document.querySelector(".thermometer-stage");
  if (!stage) return;

  stage.classList.remove("donation-surge");

  void stage.offsetWidth;

  stage.classList.add("donation-surge");

  createSparkleEnergy();

  setTimeout(() => {
    stage.classList.remove("donation-surge");
  }, 1000);
}

function renderPublic(state) {
  const { total } = totals(state);
  const displayGoal = getDisplayGoal(total, state.goal || 30000, state.goalLocked);
  const percent = (total / displayGoal) * 100;
  const originalGoal = Number(state.goal) || 30000;
  if(total >= originalGoal) {
    celebrateGoal();
  } else {
    goalCelebrated = false;
  }

  const totalElement = document.getElementById("currentTotal");

    totalElement.textContent = money(total);
    document.getElementById("percent").textContent = money(displayGoal);
    document.getElementById("percent").textContent = `${Math.round(percent)}%`;
    document.getElementById("goalText").textContent = money(displayGoal);
    document.getElementById("thermometerFill").style.height = `${Math.min(percent, 100)}%`;

  renderMilestones(state, total, displayGoal);
  if (
    window.previousPublicTotal !== undefined &&
    total > window.previousPublicTotal
  ) {
    triggerDonationSurge();
  }

  window.previousPublicTotal = total;
}

let state = loadState();

if (document.body.classList.contains("admin-page")) {
  renderAdmin(state);

  document.getElementById("saveGoal").addEventListener("click", () => {
    const goal = Number(document.getElementById("goalInput").value);

    if (!Number.isFinite(goal) || goal <= 0) {
      alert("Please enter a valid goal.");
      return;
    }

    state.goal = goal;
    saveState(state);
    renderAdmin(state);
  });
  
    const lockGoal = document.getElementById("lockGoal");
    lockGoal.checked = state.goalLocked;

    lockGoal.addEventListener("change", () => {
      state.goalLocked = lockGoal.checked;

      saveState(state);
      renderAdmin(state);
    });

  document.getElementById("items").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    const item = state.items.find(x => x.id === id);
    if (!item) return;

    if (button.dataset.action === "plus") {
      item.quantity++;
    }

    if (button.dataset.action === "minus") {
      item.quantity = Math.max(0, item.quantity - 1);
    }

    saveState(state);
    renderAdmin(state);
  });

  document.getElementById("items").addEventListener("change", event => {
    if (event.target.dataset.action !== "quantity") return;

    const id = Number(event.target.dataset.id);
    const item = state.items.find(x => x.id === id);
    if (!item) return;

    item.quantity = Math.max(0, Number(event.target.value) || 0);

    saveState(state);
    renderAdmin(state);
  });

  document.getElementById("resetCounts").addEventListener("click", () => {
    if (!confirm("Reset all auction counts to zero?")) return;

    state.items.forEach(item => item.quantity = 0);
    saveState(state);
    renderAdmin(state);
  });

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY && event.newValue) {
      state = JSON.parse(event.newValue);
      renderAdmin(state);
    }
  });
}

if (document.body.classList.contains("public-page")) {
  renderPublic(state);

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY && event.newValue) {
      state = JSON.parse(event.newValue);
      renderPublic(state);
    }
  });

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("rifc-fundraiser");

    channel.onmessage = event => {
      state = event.data;
      renderPublic(state);
    };
  }
}
