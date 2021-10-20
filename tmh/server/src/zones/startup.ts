import * as alt from 'alt';
import { zone_settings } from '@server/core/cfg';
import { IZones } from '@typings/zones';

class Zones {
	zones: IZones[] = [];

	constructor() {
		this.generate();

		alt.on('zones::generate-blips', (player: alt.Player) => {
			this.generateBlips(player);
		});

		alt.on('entityLeaveColshape', (colshape: alt.Colshape, entity: alt.Entity) => {
			this.leaveColshape(colshape, entity);
		});

		alt.on('entityEnterColshape', (colshape: alt.Colshape, entity: alt.Entity) => {
			this.enterColshape(colshape, entity);
		});
	}

	/**
	 * Событие входа в зону
	 * @param colshape - коллшэйп
	 * @param entity - объект
	 */
	private enterColshape(colshape: alt.Colshape, entity: alt.Entity): void {
		if (!colshape.hasMeta('zones::id')) return;

		const player = entity.constructor.name == 'Player' ? <alt.Player>entity : null;

		if (!!player) {
			if (colshape.isEntityIn(player))
				alt.emit(
					'sendChatMessage',
					null,
					`${player.name} вошёл в зону №${colshape.getMeta('zones::id')}!`
				);
		}
	}

	/**
	 * Событие выхода из зоны
	 * @param colshape - коллшэйп
	 * @param entity - объект
	 */
	private leaveColshape(colshape: alt.Colshape, entity: alt.Entity): void {
		if (!colshape.hasMeta('zones::id')) return;
		const player = entity.constructor.name == 'Player' ? <alt.Player>entity : null;

		if (!!player) {
			if (!colshape.isEntityIn(player))
				alt.emit(
					'sendChatMessage',
					null,
					`${player.name} вышел из зоны №${colshape.getMeta('zones::id')}!`
				);
		}

		return;
	}

	/**
	 * Вызывает генерацию блипов на карте
	 * @param player - объект игрока
	 * @returns void
	 */
	private generateBlips(player: alt.Player): void {
		try {
			if (!player) return;

			alt.emitClient(
				player,
				'zones::generate',
				JSON.stringify({
					xMin: zone_settings.xMin,
					xMax: zone_settings.xMax,
					yMin: zone_settings.yMin,
					yMax: zone_settings.yMax,
					size: zone_settings.size,
				})
			);
		} catch (error) {}
	}

	/**
	 * Вызывает генерацию зон по карте
	 */
	private generate(): void {
		try {
			let xPos = zone_settings.xMax;
			let yPos = zone_settings.yMax;
			const size = zone_settings.size;
			const zPos = 3000;

			while (true) {
				const area = new alt.ColshapeCuboid(
					xPos + size / 2,
					yPos + size / 2,
					zPos,
					xPos - size / 2,
					yPos - size / 2,
					-zPos
				);

				this.zones.push({
					id: this.zones.length,
					zone: area,
				});

				area.setMeta('zones::id', this.zones.length - 1);
				xPos -= size;
				if (xPos < zone_settings.xMin) {
					xPos = zone_settings.xMax;
					yPos -= size;
					if (yPos < zone_settings.yMin) {
						alt.log(`[SERVER] Создали зон = ${this.zones.length}`);
						break;
					}
				}
			}
		} catch (error) {}
	}
}

export default new Zones();
