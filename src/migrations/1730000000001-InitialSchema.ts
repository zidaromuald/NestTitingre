// migrations/1730000000001-InitialSchema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration initiale - Création de toutes les tables de base
 *
 * Cette migration doit être exécutée EN PREMIER avant toutes les autres
 * Elle crée le schéma initial complet de la base de données
 */
export class InitialSchema1730000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==================== ENUMS ====================

    // Enum pour les rôles utilisateurs
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator')
    `);

    // Enum pour le statut d'invitation
    await queryRunner.query(`
      CREATE TYPE invitation_statut AS ENUM ('pending', 'accepted', 'declined', 'expired')
    `);

    // Enum pour le statut de groupe
    await queryRunner.query(`
      CREATE TYPE groupe_statut AS ENUM ('active', 'archived', 'deleted')
    `);

    // Enum pour le type de visibilité de groupe
    await queryRunner.query(`
      CREATE TYPE groupe_visibilite AS ENUM ('public', 'private', 'members_only')
    `);

    // Enum pour le statut de transaction collaboration
    await queryRunner.query(`
      CREATE TYPE transaction_collaboration_statut AS ENUM ('pending', 'in_progress', 'completed', 'cancelled')
    `);

    // Enum pour le statut de message collaboration
    await queryRunner.query(`
      CREATE TYPE message_collaboration_statut AS ENUM ('sent', 'read', 'archived')
    `);

    // Enum pour le type de message collaboration
    await queryRunner.query(`
      CREATE TYPE message_collaboration_type AS ENUM ('normal', 'system', 'alert')
    `);

    // Enum pour le statut d'abonnement
    await queryRunner.query(`
      CREATE TYPE abonnement_statut AS ENUM ('active', 'inactive', 'suspended', 'expired')
    `);

    // Enum pour le type de partenaire
    await queryRunner.query(`
      CREATE TYPE partenaire_type AS ENUM ('USER', 'SOCIETE')
    `);

    // Enum pour la visibilité de page partenariat
    await queryRunner.query(`
      CREATE TYPE visibilite_page_partenariat AS ENUM ('private')
    `);

    // Enum pour le statut de transaction partenariat
    await queryRunner.query(`
      CREATE TYPE transaction_partenariat_statut AS ENUM ('pending_validation', 'validated', 'rejected')
    `);

    // Enum pour le statut de demande d'abonnement
    await queryRunner.query(`
      CREATE TYPE demande_abonnement_status AS ENUM ('pending', 'accepted', 'declined', 'expired')
    `);

    // ==================== TABLES PRINCIPALES ====================

    // Table: users
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255) NOT NULL,
        numero VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255),
        activite VARCHAR(255),
        date_naissance DATE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'user',
        email_verified_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Index pour users
    await queryRunner.query(`CREATE INDEX IDX_users_nom ON users(nom)`);
    await queryRunner.query(`CREATE INDEX IDX_users_prenom ON users(prenom)`);
    await queryRunner.query(`CREATE INDEX IDX_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX IDX_users_numero ON users(numero)`);

    // Table: user_profils
    await queryRunner.query(`
      CREATE TABLE user_profils (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        photo_profil VARCHAR(255),
        bio TEXT,
        date_naissance DATE,
        adresse TEXT,
        ville VARCHAR(255),
        code_postal VARCHAR(20),
        pays VARCHAR(255),
        telephone VARCHAR(20),
        site_web VARCHAR(255),
        reseaux_sociaux JSON,
        preferences JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_user_profils_user_id ON user_profils(user_id)`);

    // Table: societes
    await queryRunner.query(`
      CREATE TABLE societes (
        id SERIAL PRIMARY KEY,
        nom_societe VARCHAR(255) NOT NULL,
        numero VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        centre_interet VARCHAR(255) NOT NULL,
        secteur_activite VARCHAR(255) NOT NULL,
        type_produit VARCHAR(255) NOT NULL,
        adresse VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        email_verified_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_societes_nom_societe ON societes(nom_societe)`);
    await queryRunner.query(`CREATE INDEX IDX_societes_email ON societes(email)`);
    await queryRunner.query(`CREATE INDEX IDX_societes_numero ON societes(numero)`);
    await queryRunner.query(`CREATE INDEX IDX_societes_secteur_activite ON societes(secteur_activite)`);
    await queryRunner.query(`CREATE INDEX IDX_societes_secteur_type ON societes(secteur_activite, type_produit)`);

    // Table: societe_profils
    await queryRunner.query(`
      CREATE TABLE societe_profils (
        id SERIAL PRIMARY KEY,
        societe_id INT NOT NULL UNIQUE,
        photo_couverture VARCHAR(255),
        presentation_longue TEXT,
        nombre_employes INT,
        annee_creation INT,
        certifications JSON,
        reseaux_sociaux JSON,
        horaires_ouverture JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_societe_profils_societe_id ON societe_profils(societe_id)`);

    // Table: societe_users (relation many-to-many societes-users)
    await queryRunner.query(`
      CREATE TABLE societe_users (
        id SERIAL PRIMARY KEY,
        societe_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'employee',
        date_debut DATE,
        date_fin DATE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(societe_id, user_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_societe_users_societe_id ON societe_users(societe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_societe_users_user_id ON societe_users(user_id)`);

    // ==================== GROUPES ====================

    // Table: groupes
    await queryRunner.query(`
      CREATE TABLE groupes (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        created_by_id INT NOT NULL,
        created_by_type VARCHAR(100) NOT NULL,
        statut groupe_statut NOT NULL DEFAULT 'active',
        max_membres INT NOT NULL DEFAULT 50,
        visibilite groupe_visibilite NOT NULL DEFAULT 'public',
        admin_user_id INT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_groupes_nom ON groupes(nom)`);
    await queryRunner.query(`CREATE INDEX IDX_groupes_created_by ON groupes(created_by_id, created_by_type)`);

    // Table: groupe_profils
    await queryRunner.query(`
      CREATE TABLE groupe_profils (
        id SERIAL PRIMARY KEY,
        groupe_id INT NOT NULL UNIQUE,
        regles TEXT,
        categories JSON,
        tags JSON,
        contact_email VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_groupe_profils_groupe_id ON groupe_profils(groupe_id)`);

    // Table: groupe_users (membres du groupe)
    await queryRunner.query(`
      CREATE TABLE groupe_users (
        id SERIAL PRIMARY KEY,
        groupe_id INT NOT NULL,
        member_id INT NOT NULL,
        member_type VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE,
        UNIQUE(groupe_id, member_id, member_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_groupe_users_groupe_id ON groupe_users(groupe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_groupe_users_member ON groupe_users(member_id, member_type)`);

    // Table: groupe_invitations
    await queryRunner.query(`
      CREATE TABLE groupe_invitations (
        id SERIAL PRIMARY KEY,
        groupe_id INT NOT NULL,
        invited_id INT NOT NULL,
        invited_type VARCHAR(100) NOT NULL,
        inviter_id INT NOT NULL,
        inviter_type VARCHAR(100) NOT NULL,
        statut invitation_statut NOT NULL DEFAULT 'pending',
        message TEXT,
        expires_at TIMESTAMP,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE,
        UNIQUE(groupe_id, invited_id, invited_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_groupe_invitations_groupe_id ON groupe_invitations(groupe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_groupe_invitations_invited ON groupe_invitations(invited_id, invited_type)`);
    await queryRunner.query(`CREATE INDEX IDX_groupe_invitations_inviter ON groupe_invitations(inviter_id, inviter_type)`);

    // ==================== POSTS ====================

    // Table: posts
    await queryRunner.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        groupe_id INT,
        societe_id INT,
        posted_by_id INT NOT NULL,
        posted_by_type VARCHAR(100) NOT NULL,
        contenu TEXT NOT NULL,
        images JSON,
        videos JSON,
        audios JSON,
        documents JSON,
        visibilite VARCHAR(50) NOT NULL DEFAULT 'public',
        likes_count INT NOT NULL DEFAULT 0,
        comments_count INT NOT NULL DEFAULT 0,
        shares_count INT NOT NULL DEFAULT 0,
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        is_edited BOOLEAN NOT NULL DEFAULT false,
        edited_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE SET NULL,
        FOREIGN KEY (societe_id) REFERENCES societes(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_posts_posted_by ON posts(posted_by_id, posted_by_type)`);
    await queryRunner.query(`CREATE INDEX IDX_posts_groupe_id ON posts(groupe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_posts_societe_id ON posts(societe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_posts_created_at ON posts(created_at)`);

    // Table: likes
    await queryRunner.query(`
      CREATE TABLE likes (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        liked_by_id INT NOT NULL,
        liked_by_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE(post_id, liked_by_id, liked_by_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_likes_post_id ON likes(post_id)`);
    await queryRunner.query(`CREATE INDEX IDX_likes_liked_by ON likes(liked_by_id, liked_by_type)`);

    // Table: commentaires
    await queryRunner.query(`
      CREATE TABLE commentaires (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        commented_by_id INT NOT NULL,
        commented_by_type VARCHAR(100) NOT NULL,
        contenu TEXT NOT NULL,
        parent_comment_id INT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES commentaires(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_commentaires_post_id ON commentaires(post_id)`);
    await queryRunner.query(`CREATE INDEX IDX_commentaires_commented_by ON commentaires(commented_by_id, commented_by_type)`);
    await queryRunner.query(`CREATE INDEX IDX_commentaires_parent_comment_id ON commentaires(parent_comment_id)`);

    // ==================== SUIVIS ====================

    // Table: suivis
    await queryRunner.query(`
      CREATE TABLE suivis (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        user_type VARCHAR(100) NOT NULL,
        followed_id INT NOT NULL,
        followed_type VARCHAR(100) NOT NULL,
        date_suivi TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, user_type, followed_id, followed_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_suivis_user ON suivis(user_id, user_type)`);
    await queryRunner.query(`CREATE INDEX IDX_suivis_followed ON suivis(followed_id, followed_type)`);

    // Table: invitations_suivi
    await queryRunner.query(`
      CREATE TABLE invitations_suivi (
        id SERIAL PRIMARY KEY,
        sender_id INT NOT NULL,
        sender_type VARCHAR(100) NOT NULL,
        receiver_id INT NOT NULL,
        receiver_type VARCHAR(100) NOT NULL,
        statut invitation_statut NOT NULL DEFAULT 'pending',
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(sender_id, sender_type, receiver_id, receiver_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_invitations_suivi_sender ON invitations_suivi(sender_id, sender_type)`);
    await queryRunner.query(`CREATE INDEX IDX_invitations_suivi_receiver ON invitations_suivi(receiver_id, receiver_type)`);
    await queryRunner.query(`CREATE INDEX IDX_invitations_suivi_statut ON invitations_suivi(statut)`);

    // Table: abonnements
    await queryRunner.query(`
      CREATE TABLE abonnements (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        societe_id INT NOT NULL,
        plan VARCHAR(100),
        statut abonnement_statut NOT NULL DEFAULT 'active',
        date_debut TIMESTAMP NOT NULL DEFAULT NOW(),
        date_fin TIMESTAMP,
        montant DECIMAL(10,2),
        metadata JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, societe_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_abonnements_user_id ON abonnements(user_id)`);
    await queryRunner.query(`CREATE INDEX IDX_abonnements_societe_id ON abonnements(societe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_abonnements_statut ON abonnements(statut)`);

    // Table: demandes_abonnement
    await queryRunner.query(`
      CREATE TABLE demandes_abonnement (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        societe_id INT NOT NULL,
        status demande_abonnement_status NOT NULL DEFAULT 'pending',
        plan_demande VARCHAR(100),
        titre_partenariat VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, societe_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_demandes_abonnement_user_id ON demandes_abonnement(user_id)`);
    await queryRunner.query(`CREATE INDEX IDX_demandes_abonnement_societe_id ON demandes_abonnement(societe_id)`);
    await queryRunner.query(`CREATE INDEX IDX_demandes_abonnement_status ON demandes_abonnement(status)`);

    // ==================== PARTENARIATS ====================

    // Table: pages_partenariat
    await queryRunner.query(`
      CREATE TABLE pages_partenariat (
        id SERIAL PRIMARY KEY,
        abonnement_id INT NOT NULL UNIQUE,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        visibilite visibilite_page_partenariat NOT NULL DEFAULT 'private',
        nombre_transactions INT NOT NULL DEFAULT 0,
        montant_total DECIMAL(10,2) NOT NULL DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (abonnement_id) REFERENCES abonnements(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_pages_partenariat_abonnement_id ON pages_partenariat(abonnement_id)`);

    // Table: transactions_partenariat
    await queryRunner.query(`
      CREATE TABLE transactions_partenariat (
        id SERIAL PRIMARY KEY,
        page_partenariat_id INT NOT NULL,
        produit VARCHAR(255) NOT NULL,
        quantite INT NOT NULL,
        prix_unitaire DECIMAL(10,2) NOT NULL,
        montant_total DECIMAL(10,2) NOT NULL,
        date_debut TIMESTAMP,
        date_fin TIMESTAMP,
        periode_label VARCHAR(100),
        unite VARCHAR(50),
        statut transaction_partenariat_statut NOT NULL DEFAULT 'pending_validation',
        validee_par_user BOOLEAN NOT NULL DEFAULT false,
        date_validation_user TIMESTAMP,
        commentaire_validation TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (page_partenariat_id) REFERENCES pages_partenariat(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_transactions_partenariat_page ON transactions_partenariat(page_partenariat_id)`);
    await queryRunner.query(`CREATE INDEX IDX_transactions_partenariat_statut ON transactions_partenariat(statut)`);

    // Table: informations_partenaires
    await queryRunner.query(`
      CREATE TABLE informations_partenaires (
        id SERIAL PRIMARY KEY,
        page_partenariat_id INT NOT NULL,
        partenaire_id INT NOT NULL,
        partenaire_type partenaire_type NOT NULL,
        creee_par partenaire_type NOT NULL,
        cle VARCHAR(255) NOT NULL,
        valeur TEXT NOT NULL,
        date_creation TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (page_partenariat_id) REFERENCES pages_partenariat(id) ON DELETE CASCADE,
        UNIQUE(page_partenariat_id, partenaire_id, partenaire_type, cle)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_informations_partenaires_page ON informations_partenaires(page_partenariat_id)`);
    await queryRunner.query(`CREATE INDEX IDX_informations_partenaires_partenaire ON informations_partenaires(partenaire_id, partenaire_type)`);

    // ==================== TRANSACTIONS COLLABORATION ====================

    // Table: transactions_collaboration
    await queryRunner.query(`
      CREATE TABLE transactions_collaboration (
        id SERIAL PRIMARY KEY,
        client_principal_id INT NOT NULL,
        client_principal_type VARCHAR(100) NOT NULL,
        prestataire_id INT NOT NULL,
        prestataire_type VARCHAR(100) NOT NULL,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        montant DECIMAL(10,2),
        statut transaction_collaboration_statut NOT NULL DEFAULT 'pending',
        date_debut TIMESTAMP,
        date_fin TIMESTAMP,
        metadata JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_transactions_collaboration_client ON transactions_collaboration(client_principal_id, client_principal_type)`);
    await queryRunner.query(`CREATE INDEX IDX_transactions_collaboration_prestataire ON transactions_collaboration(prestataire_id, prestataire_type)`);
    await queryRunner.query(`CREATE INDEX IDX_transactions_collaboration_statut ON transactions_collaboration(statut)`);

    // ==================== MESSAGES ====================

    // Table: conversations
    await queryRunner.query(`
      CREATE TABLE conversations (
        id SERIAL PRIMARY KEY,
        participant1_id INT NOT NULL,
        participant1_type VARCHAR(100) NOT NULL,
        participant2_id INT NOT NULL,
        participant2_type VARCHAR(100) NOT NULL,
        last_message_at TIMESTAMP,
        participant1_archived BOOLEAN NOT NULL DEFAULT false,
        participant2_archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(participant1_id, participant1_type, participant2_id, participant2_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_conversations_participant1 ON conversations(participant1_id, participant1_type)`);
    await queryRunner.query(`CREATE INDEX IDX_conversations_participant2 ON conversations(participant2_id, participant2_type)`);

    // Table: messages_collaboration
    await queryRunner.query(`
      CREATE TABLE messages_collaboration (
        id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        sender_type VARCHAR(100) NOT NULL,
        recipient_id INT NOT NULL,
        recipient_type VARCHAR(100) NOT NULL,
        contenu TEXT NOT NULL,
        type message_collaboration_type NOT NULL DEFAULT 'normal',
        statut message_collaboration_statut NOT NULL DEFAULT 'sent',
        lu_a TIMESTAMP,
        fichiers JSON,
        transaction_collaboration_id INT,
        abonnement_id INT,
        metadata JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (transaction_collaboration_id) REFERENCES transactions_collaboration(id) ON DELETE SET NULL,
        FOREIGN KEY (abonnement_id) REFERENCES abonnements(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_messages_collaboration_conversation ON messages_collaboration(conversation_id)`);
    await queryRunner.query(`CREATE INDEX IDX_messages_collaboration_sender ON messages_collaboration(sender_id, sender_type)`);
    await queryRunner.query(`CREATE INDEX IDX_messages_collaboration_recipient ON messages_collaboration(recipient_id, recipient_type)`);

    // Table: notifications
    await queryRunner.query(`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        recipient_id INT NOT NULL,
        recipient_type VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON,
        read BOOLEAN NOT NULL DEFAULT false,
        read_at TIMESTAMP,
        action_url VARCHAR(500),
        sender_id INT,
        sender_type VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_notifications_recipient ON notifications(recipient_id, recipient_type)`);
    await queryRunner.query(`CREATE INDEX IDX_notifications_read ON notifications(read)`);
    await queryRunner.query(`CREATE INDEX IDX_notifications_created ON notifications(created_at)`);

    // Table: notification_preferences
    await queryRunner.query(`
      CREATE TABLE notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        user_type VARCHAR(100) NOT NULL,
        email_notifications BOOLEAN NOT NULL DEFAULT true,
        push_notifications BOOLEAN NOT NULL DEFAULT true,
        sms_notifications BOOLEAN NOT NULL DEFAULT false,
        notification_types JSON,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, user_type)
      )
    `);

    await queryRunner.query(`CREATE INDEX IDX_notification_preferences_user ON notification_preferences(user_id, user_type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer toutes les tables dans l'ordre inverse des dépendances
    await queryRunner.query(`DROP TABLE IF EXISTS notification_preferences CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages_collaboration CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions_collaboration CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS informations_partenaires CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS transactions_partenariat CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS pages_partenariat CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS demandes_abonnement CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS abonnements CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS invitations_suivi CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS suivis CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS commentaires CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS likes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS groupe_invitations CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS groupe_users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS groupe_profils CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS groupes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS societe_users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS societe_profils CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS societes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_profils CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);

    // Supprimer tous les enums
    await queryRunner.query(`DROP TYPE IF EXISTS demande_abonnement_status CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_partenariat_statut CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS visibilite_page_partenariat CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS partenaire_type CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS abonnement_statut CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS message_collaboration_type CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS message_collaboration_statut CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_collaboration_statut CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS groupe_visibilite CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS groupe_statut CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS invitation_statut CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role CASCADE`);
  }
}
