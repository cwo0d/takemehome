import * as alt from 'alt';

class Core {
	constructor() {
		alt.on('playerConnect', (player: alt.Player) => {
			this.connect(player);
		});

		alt.onClient('cmd::vehicle', (player: alt.Player, vehicle: string) => {
			this.createVehicle(player, vehicle);
		});
	}

	/**
	 * Создает автомобиль по команде из консоли F8
	 * @param player - объект игрока
	 * @param vehicle - модель автомобиля
	 */
	private createVehicle(player: alt.Player, vehicle: string) {
		if (!player || !vehicle) return;
		try {
			const v = new alt.Vehicle(
				vehicle,
				player.pos.x,
				player.pos.y,
				player.pos.z,
				0.0,
				0.0,
				0.0
			);
			if (v) alt.emit('sendChatMessage', player, `${player.name} созал ${vehicle}!`);
		} catch (error) {
			alt.emit('sendChatMessage', player, `${player.name} не удалось создать ${vehicle}!`);
		}
	}

	/**
	 * Событие которое вызывается при коннекте игрока к серверу
	 * @param player - объект игрока
	 * @reutnrs void
	 */
	private connect(player: alt.Player) {
		if (!player) return;
		alt.emit('sendChatMessage', player, `${player.name} присоединился!`);

		try {
			player.model = 'u_m_y_imporage';
			player.spawn(240.61, -1503.18, 29.14, 100);
			alt.emit('zones::generate-blips', player);
		} catch (error) {
			throw Error(error);
		}
	}
}

export default new Core();
