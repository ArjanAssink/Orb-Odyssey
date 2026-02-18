export class Menu {
  private el: HTMLElement

  constructor(container: HTMLElement, onPlay: () => void) {
    this.el = document.createElement('div')
    this.el.className = 'menu'
    this.el.innerHTML = `
      <div class="menu-content">
        <h1 class="menu-title">Orb Odyssey</h1>
        <p class="menu-subtitle">Roll your ball &bull; Collect the orbs &bull; Reach the goal!</p>
        <button class="menu-button" id="play-btn">Play</button>
      </div>
    `
    container.appendChild(this.el)

    this.el.querySelector('#play-btn')!.addEventListener('click', () => {
      onPlay()
      this.hide()
    })
  }

  show(): void {
    this.el.style.display = 'flex'
  }

  hide(): void {
    this.el.style.display = 'none'
  }
}
