const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ erro: "Token não enviado." });

        const partes = authHeader.split(" ");
        if (partes.length !== 2) return res.status(401).json({ erro: "Formato do token inválido." });

        const [tipo, token] = partes;
        if (tipo !== "Bearer") return res.status(401).json({ erro: "Formato do token inválido." });

        const dadosToken = jwt.verify(token, process.env.JWT_SECRET);

        req.utilizador = {
            id: dadosToken.id,
            email: dadosToken.email,
            tipoToken: dadosToken.tipoToken || "PERFIL",
            tiposUtilizador: dadosToken.tiposUtilizador || [],
            perfilAtivo: dadosToken.perfilAtivo || null,
            tipoPerfilAtivo: dadosToken.tipoPerfilAtivo || null,
            modoAtivo: dadosToken.modoAtivo || dadosToken.tipoPerfilAtivo || null
        };

        next();
    } catch (erro) {
        return res.status(401).json({ erro: "Token inválido ou expirado." });
    }
}

module.exports = authMiddleware;
