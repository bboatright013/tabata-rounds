'use client'
import { cloneElement, Fragment } from "react"
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import CloseIcon from '@mui/icons-material/Close'
import React from "react"

type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Drawer({ isOpen, onClose, children }: DrawerProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-hidden" onClose={onClose}>
        <div className="absolute inset-0 overflow-hidden">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={onClose}
            />
          </TransitionChild>
          <div className="fixed inset-y-0 right-0 flex w-full max-w-full">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <DialogPanel className="w-full bg-gray-800 shadow-lg flex flex-col items-center justify-center relative">
              {React.isValidElement(children)
                ? cloneElement(children as React.ReactElement)
                : children}

                <button onClick={onClose} className="absolute top-2 right-2 text-white">
                  <CloseIcon fontSize="large" />
                </button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
