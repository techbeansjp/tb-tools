'use client';

import React from 'react'
import { Modal } from './modal'
import { Button } from './button'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
}

export function ComingSoonModal({ isOpen, onClose, featureName }: ComingSoonModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          作成中
        </h2>
        {featureName && (
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            「{featureName}」は現在開発中です
          </p>
        )}
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          この機能は近日公開予定です。<br />
          もうしばらくお待ちください。
        </p>
        <Button onClick={onClose} className="w-full">
          閉じる
        </Button>
      </div>
    </Modal>
  )
}