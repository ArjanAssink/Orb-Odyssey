export class HUD {
  private scoreEl!: HTMLElement
  private messageEl!: HTMLElement

  constructor(container: HTMLElement) {
    const hud = document.createElement('div')
    hud.className = 'hud'
    hud.innerHTML = `
      <div class="hud-score">⭐ <span id="hud-score-text">0 / 0</span></div>
    `
    container.appendChild(hud)

    this.messageEl = document.createElement('div')
    this.messageEl.className = 'hud-message hidden'
    container.appendChild(this.messageEl)

    this.scoreEl = hud.querySelector('#hud-score-text')!
  }

  setScore(collected: number, required: number): void {
    this.scoreEl.textContent = `${collected} / ${required}`
  }

  showMessage(title: string, sub?: string): void {
    this.messageEl.innerHTML = `
      ${title}
      ${sub ? `<span class="sub">${sub}</span>` : ''}
    `
    this.messageEl.classList.remove('hidden')
    this.messageEl.style.pointerEvents = 'all'
  }

  hideMessage(): void {
    this.messageEl.classList.add('hidden')
    this.messageEl.style.pointerEvents = 'none'
  }
}
