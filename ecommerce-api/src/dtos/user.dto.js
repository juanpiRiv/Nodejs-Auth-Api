class UserDTO {
    constructor(user) {
        this.name = `${user.first_name} ${user.last_name || ''}`.trim(); // Combina nombre y apellido
        this.email = user.email;
        this.role = user.role;
    }
}

export default UserDTO;
