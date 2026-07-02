import * as React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Right-aligned action buttons. */
  actions?: React.ReactNode
}

/**
 * Content container with flat, low-radius surface. Compose with CardHeader / CardBody / CardFooter.
 * @dsComponent
 */
export function Card(props: CardProps): JSX.Element
export function CardHeader(props: CardHeaderProps): JSX.Element
export function CardBody(props: CardProps): JSX.Element
export function CardFooter(props: CardProps): JSX.Element
