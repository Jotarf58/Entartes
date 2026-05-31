function autorizarTipos(...tiposPermitidos) {
    return (req, res, next) => {
        if (!req.utilizador) return res.status(401).json({ erro: "Utilizador não autenticado." });

        const tipoPerfil = req.utilizador.tipoPerfilAtivo;
        const tiposDaConta = req.utilizador.tiposUtilizador || [];

        if (tipoPerfil && tiposPermitidos.includes(tipoPerfil)) return next();
        if (!tipoPerfil && tiposDaConta.some((tipo) => tiposPermitidos.includes(tipo))) return next();

        return res.status(403).json({ erro: "Sem permissão para aceder a este recurso." });
    };
}

module.exports = autorizarTipos;
