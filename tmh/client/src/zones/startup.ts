import { IZones } from '@typings/zones';
import * as alt from 'alt';

class Zones {
	/** Массив с цветами, для окраса зон */
	colors: number[] = [2, 50, 79, 68, 85, 61, 71, 25];

	/** Массив, в котором хранятся все созданные зоны */
	zones: IZones[] = [];

	constructor() {
		alt.onServer('zones::generate', (dataJSON: string) => {
			this.generate(dataJSON);
		});

		alt.on('consoleCommand', (cmd: string, ...args: any[]) => {
			if (cmd == 'vehicle') {
				if (!args[0]) return;
				alt.emitServer('cmd::vehicle', args[0]);
				return;
			}
		});
	}

	/**
	 * Генерируем зоны на карте
	 * @param dataJSON - данные в JSON строке
	 * @returns void
	 */
	private generate(dataJSON: string): void {
		const { xMin, xMax, yMin, yMax, size } = JSON.parse(dataJSON);

		if (!size) return;

		let xPos = xMax;
		let yPos = yMax;

		while (true) {
			const color = this.colors[Math.floor(Math.random() * this.colors.length)];
			const area = new alt.AreaBlip(xPos, yPos, 1000, size, size);
			area.sprite = 2;
			area.color = color;
			area.alpha = 100;
			area.heading = 90;

			this.zones.push({
				x: xPos,
				y: yPos,
				zone: area,
			});

			xPos -= size;
			if (xPos < xMin) {
				xPos = xMax;
				yPos -= size;
				if (yPos < yMin) {
					alt.log(`Создали зон = ${this.zones.length}`);
					break;
				}
			}
		}
	}
}

export default new Zones();
