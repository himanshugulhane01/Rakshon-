"""Initial ScamShield schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-16 16:26:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('phone_number', sa.String(length=32), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('language', sa.String(length=5), nullable=False, server_default='en'),
        sa.Column('role', sa.Enum('SENIOR', 'CAREGIVER', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=True)

    # 2. scam_indicators table (syncs to Android Room)
    op.create_table(
        'scam_indicators',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('indicator_type', sa.Enum('PHONE_NUMBER', 'PHONE_PREFIX', 'UPI_HANDLE', 'PHISHING_DOMAIN', 'KEYWORD_PATTERN', name='indicatortype'), nullable=False),
        sa.Column('value', sa.String(length=255), nullable=False),
        sa.Column('severity', sa.Enum('HIGH', 'MEDIUM', 'LOW', name='threatseverity'), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('language', sa.String(length=5), nullable=False, server_default='en'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_scam_indicators_id'), 'scam_indicators', ['id'], unique=False)
    op.create_index(op.f('ix_scam_indicators_indicator_type'), 'scam_indicators', ['indicator_type'], unique=False)
    op.create_index(op.f('ix_scam_indicators_value'), 'scam_indicators', ['value'], unique=False)
    op.create_index(op.f('ix_scam_indicators_is_active'), 'scam_indicators', ['is_active'], unique=False)
    op.create_index(op.f('ix_scam_indicators_version'), 'scam_indicators', ['version'], unique=False)

    # 3. family_circles table (Consent-based safety circle)
    op.create_table(
        'family_circles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('senior_id', sa.Integer(), nullable=False),
        sa.Column('caregiver_id', sa.Integer(), nullable=True),
        sa.Column('consent_code', sa.String(length=6), nullable=False),
        sa.Column('consent_code_expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACTIVE', 'REVOKED', name='circleconsentstatus'), nullable=False),
        sa.Column('relationship_label', sa.String(length=50), nullable=True),
        sa.Column('strict_privacy_enforced', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('consent_granted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('consent_revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['caregiver_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['senior_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_family_circles_id'), 'family_circles', ['id'], unique=False)
    op.create_index(op.f('ix_family_circles_senior_id'), 'family_circles', ['senior_id'], unique=False)
    op.create_index(op.f('ix_family_circles_caregiver_id'), 'family_circles', ['caregiver_id'], unique=False)
    op.create_index(op.f('ix_family_circles_consent_code'), 'family_circles', ['consent_code'], unique=False)
    op.create_index(op.f('ix_family_circles_status'), 'family_circles', ['status'], unique=False)

    # 4. emergency_events table
    op.create_table(
        'emergency_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.Enum('MANUAL_PANIC', 'CYBER_HELPLINE_ASSIST', 'BANK_FREEZE_GUIDANCE', name='emergencyeventtype'), nullable=False),
        sa.Column('status', sa.Enum('INITIATED', 'RESOLVED', 'CANCELLED', name='emergencyeventstatus'), nullable=False),
        sa.Column('helpline_dialed', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('bank_name_guided', sa.String(length=100), nullable=True),
        sa.Column('message_user_reviewed', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emergency_events_id'), 'emergency_events', ['id'], unique=False)
    op.create_index(op.f('ix_emergency_events_user_id'), 'emergency_events', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('emergency_events')
    op.drop_table('family_circles')
    op.drop_table('scam_indicators')
    op.drop_table('users')

